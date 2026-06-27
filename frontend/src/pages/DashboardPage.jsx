import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages } from '../api/messages'
import { getChannels } from '../api/channels'
import { getOrganizations } from '../api/organizations'
import { setMessages, setMessagesLoading } from '../store/messageSlice'
import { setChannels, setChannelsLoading, setActiveDmChannelId } from '../store/channelSlice'
import { setConvertingMessage } from '../store/uiSlice'
import { setCredentials } from '../store/authSlice'
import { WebSocketProvider } from '../providers/WebSocketProvider'
import Sidebar from '../components/sidebar/Sidebar'
import ChatPanel from '../components/chat/ChatPanel'
import BoardView from '../components/boards/BoardView'
import TaskPanel from '../components/tasks/TaskPanel'
import CommandPalette from '../components/common/CommandPalette'
import { CallProvider } from '../components/call/CallContext'
import CallModal from '../components/call/CallModal'
import IncomingCallOverlay from '../components/call/IncomingCallOverlay'
import client from '../api/client'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activeChannelId = useSelector(state => state.channels.activeId)
  const channels = useSelector(state => state.channels.items)
  const user = useSelector(state => state.auth.user)

  const activeDmUserId = useSelector(state => state.channels.activeDmUserId)
  const activeDmUser = useSelector(state => state.channels.activeDmUser)
  
  const activeBoard = useSelector(state => state.boards.activeBoard)

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await client.get('/users/me')
        dispatch(setCredentials({
          token: localStorage.getItem('token'),
          user: res.data,
        }))
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [dispatch])

  // Fetch organizations and channels on mount
  useEffect(() => {
    const fetchOrgAndChannels = async () => {
      dispatch(setChannelsLoading(true))
      try {
        const orgRes = await getOrganizations()
        if (orgRes.data.length > 0) {
          const storedActiveId = localStorage.getItem('activeOrganizationId')
          // Check if the stored active ID is valid for this user
          const isValidActiveId = storedActiveId && orgRes.data.some(org => org.id === parseInt(storedActiveId, 10))
          
          if (!isValidActiveId) {
            // Only overwrite if it's missing or invalid
            const org = orgRes.data[0]
            localStorage.setItem('activeOrganizationId', org.id)
          }
          
          const chRes = await getChannels()
          dispatch(setChannels(chRes.data))
        } else {
          navigate('/onboarding')
        }
      } catch (err) {
        console.error('Failed to fetch orgs and channels:', err)
      } finally {
        dispatch(setChannelsLoading(false))
      }
    }
    fetchOrgAndChannels()
  }, [dispatch, navigate])

  // Handle DM selection by fetching/creating the implicit DM channel
  useEffect(() => {
    if (!activeDmUserId) return

    const fetchDmChannel = async () => {
      try {
        const res = await client.get(`/channels/dm/${activeDmUserId}`)
        dispatch(setActiveDmChannelId(res.data.id))
      } catch (err) {
        console.error('Failed to fetch DM channel:', err)
      }
    }
    
    fetchDmChannel()
  }, [activeDmUserId, dispatch])

  // Fetch messages when active public channel changes
  useEffect(() => {
    if (!activeChannelId) return

    const fetchData = async () => {
      dispatch(setMessagesLoading(true))
      try {
        const msgRes = await getMessages(activeChannelId)
        dispatch(setMessages(msgRes.data))
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        dispatch(setMessagesLoading(false))
      }
    }
    fetchData()
  }, [activeChannelId, dispatch])

  const filter = useSelector(state => state.messages.filter || 'all')

  // Get active channel name (or DM username)
  const activeChannel = channels.find(c => c.id === activeChannelId)
  const channelName = filter === 'mentions'
    ? 'Mentions & Reactions'
    : filter === 'saved'
    ? 'Saved Items'
    : activeDmUser
    ? activeDmUser.full_name || activeDmUser.email
    : (activeChannel?.name || 'general')

  // Chat-to-Task pipeline
  const handleConvertToTask = (messageContent) => {
    dispatch(setConvertingMessage(messageContent))
  }

  return (
    <WebSocketProvider>
      <CallProvider>
        <div className="flex h-screen overflow-hidden bg-white dark:bg-surface-950">
          <Sidebar />
          {activeBoard ? (
            <BoardView />
          ) : (
            <ChatPanel channelName={channelName} onConvertToTask={handleConvertToTask} />
          )}
          <TaskPanel />
          <CommandPalette />
          <CallModal />
          <IncomingCallOverlay />
        </div>
      </CallProvider>
    </WebSocketProvider>
  )
}
