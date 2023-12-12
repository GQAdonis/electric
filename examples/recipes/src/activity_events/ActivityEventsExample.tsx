/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Container } from "@mui/material"
import { NavigationBar } from "../components/NavigationBar"
import { useEffect } from "react"
import { useElectric } from "../electric/ElectricWrapper"
import { generateActivity } from "./utilities"
import { ActivityToast } from "./ActivityToast"
import { ActivityPopover } from "./ActivityPopover"

export const ActivityEventsExample = () => {
  const { db } = useElectric()!
  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.activity_events.sync()

      // Resolves when the data has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [])

  const generateUserActivity = () => {
    db.activity_events.create({
      data: generateActivity()
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavigationBar title="Activity Events" items={
        [
          <ActivityPopover key="notifications" />
        ]
      }/>
      <Container maxWidth="sm" sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
          <Button variant="contained" size="large" onClick={generateUserActivity}>
            Generate activity
          </Button>
        <ActivityToast />
      </Container>
    </Box>
  )

}
