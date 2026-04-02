import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Advantage from './components/Advantage'
import Comparison from './components/Comparison'
import AudienceCTA from './components/AudienceCTA'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Advantage />
        <Comparison />
        <AudienceCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
