defmodule Electric.Shapes.Filter.Index do
  @moduledoc """
  Responsible for knowing which shapes are affected by a change to a specific field.

  The `%Table{}` struct contains `values` a map of values for a specific field to shapes that are affected by that field value.
  This acts as an index for the shapes, providing a fast way to know which shapes have been affected without having to
  iterate over all the shapes.

  Currently only `=` operations are indexed.
  """

  alias Electric.Replication.Eval.Env
  alias Electric.Shapes.Filter.Index
  alias Electric.Shapes.WhereClause
  alias Electric.Telemetry.OpenTelemetry
  require Logger

  defstruct [:type, :values]

  def new(type), do: %Index{type: type, values: %{}}

  def empty?(%Index{values: values}), do: values == %{}

  def add_shape(%Index{} = index, value, {shape_id, shape}, and_where) do
    shape_info = %{shape: shape, and_where: and_where}

    %{
      index
      | values:
          Map.update(
            index.values,
            value,
            %{shape_id => shape_info},
            &Map.put(&1, shape_id, shape_info)
          )
    }
  end

  def remove_shape(%Index{} = index, shape_id) do
    %{
      index
      | values:
          index.values
          |> Map.new(fn {value, shapes} -> {value, Map.delete(shapes, shape_id)} end)
          |> Enum.reject(fn {_value, shapes} -> shapes == %{} end)
          |> Map.new()
    }
  end

  def affected_shapes(%Index{values: values, type: type}, field, record) do
    case Map.get(values, value_from_record(record, field, type)) do
      nil ->
        MapSet.new()

      shapes ->
        OpenTelemetry.with_span(
          "filter.index.filter_matched_shapes",
          [field: field, matched_shapes_count: map_size(shapes)],
          fn ->
            for {shape_id, shape} <- shapes,
                WhereClause.includes_record?(shape.and_where, record),
                into: MapSet.new() do
              shape_id
            end
          end
        )
    end
  end

  @env Env.new()
  defp value_from_record(record, field, type) do
    case Env.parse_const(@env, record[field], type) do
      {:ok, value} ->
        value

      :error ->
        raise RuntimeError,
          message: "Could not parse value for field #{inspect(field)} of type #{inspect(type)}"
    end
  end

  def all_shapes(%Index{values: values}) do
    for {_value, shapes} <- values,
        {shape_id, %{shape: shape}} <- shapes,
        into: %{} do
      {shape_id, shape}
    end
  end
end
