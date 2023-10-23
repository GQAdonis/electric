import test from 'ava'
import MemoryStorage from 'memorystorage'
import { uniqueTabId } from '../../src/util/tab'
import { uuid } from '../../src/util/common'

test('returns same tab ID', async (t) => {
  const { tabId, usingExisting } = uniqueTabId()
  const { tabId: tabId2, usingExisting: usingExisting2 } = uniqueTabId()

  t.is(tabId, tabId2)
  t.false(usingExisting)
  t.true(usingExisting2)
})

test('works with passed in storage', async (t) => {
  const storage = new MemoryStorage(uuid())

  const { tabId } = uniqueTabId({ storage: storage })
  const { tabId: tabId2 } = uniqueTabId({ storage: storage })

  t.is(tabId, tabId2)
})

test('works when storage errors', async (t) => {
  const storage = {
    getItem: () => {
      throw new Error('getItem')
    },
    setItem: () => {
      throw new Error('setItem')
    },
  }

  const { tabId } = uniqueTabId({ storage: storage })
  const { tabId: tabId2 } = uniqueTabId({ storage: storage })

  t.is(tabId, tabId2)
})

test('handles duplicate tabs', async (t) => {
  const storage = new MemoryStorage(uuid())
  const navEntries = [{ type: 'back_forward' }]

  const { tabId, mayBeDuplicate } = uniqueTabId({
    storage: storage,
    navEntries: navEntries,
  })
  const { tabId: tabId2 } = uniqueTabId({
    storage: storage,
    navEntries: navEntries,
  })

  t.not(tabId, tabId2)
  t.true(mayBeDuplicate)
})
