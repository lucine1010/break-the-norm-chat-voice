import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import ProfileSetup from './components/ProfileSetup'
import MatchPage from './components/MatchPage'
import ChatPage from './components/ChatPage'

const mockMatches = [
  {
    id: 'm1',
    name: 'Elisa',
    age: 23,
    hobbies: 'Music, Movie',
    bio: 'Loves cozy playlists and late-night movie swaps.',
  },
  {
    id: 'm2',
    name: 'Noa',
    age: 24,
    hobbies: 'Travel, Art',
    bio: 'Sketchbook collector and weekend city explorer.',
  },
  {
    id: 'm3',
    name: 'Kai',
    age: 25,
    hobbies: 'Books, Tech',
    bio: 'Builds side projects and reads sci-fi.',
  },
]

const initialMessages = [
  {
    id: 'msg-1',
    sender: 'match',
    text: 'Hey! How has your week been?',
  },
  {
    id: 'msg-2',
    sender: 'me',
    text: 'Pretty good, just busy with work. You?',
  },
  {
    id: 'msg-3',
    sender: 'match',
    text: 'Same here, but I finally took a break and went hiking yesterday.',
  },
]

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [userProfile, setUserProfile] = useState({
    name: '',
    style: '',
    interests: '',
    favoriteTopics: '',
    avoidTopics: '',
    avoidTopicsOther: '',
    conversationEnjoyment: '',
    exampleMessage: '',
  })

  const [selectedMatch, setSelectedMatch] = useState(null)
  const [chatMessages, setChatMessages] = useState(initialMessages)

  const handleStartChat = (match) => {
    setSelectedMatch(match)
    setChatMessages(initialMessages)
    setCurrentScreen('chat')
  }

  const renderScreen = () => {
    if (currentScreen === 'welcome') {
      return <WelcomeScreen onSignUp={() => setCurrentScreen('profileSetup')} />
    }

    if (currentScreen === 'profileSetup') {
      return (
        <ProfileSetup
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          setCurrentScreen={setCurrentScreen}
        />
      )
    }

    if (currentScreen === 'match') {
      return <MatchPage matches={mockMatches} onStartChat={handleStartChat} />
    }

    if (currentScreen === 'chat') {
      return (
        <ChatPage
          userProfile={userProfile}
          selectedMatch={selectedMatch}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          onBack={() => setCurrentScreen('match')}
        />
      )
    }

    return null
  }

  return (
    <main className="min-h-screen bg-[#efe8c8] p-0 sm:p-6">
      <div className="max-w-[400px] mx-auto h-[100dvh] relative overflow-hidden bg-[#f5f1dd] shadow-2xl border-2 border-[#d3bc75] sm:rounded-3xl sm:mt-10">
        {renderScreen()}
      </div>
    </main>
  )
}

export default App
