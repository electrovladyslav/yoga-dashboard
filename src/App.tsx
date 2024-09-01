import './App.css'
import { TrainingPage } from './pages/training-page';

function App() {

  return (
    <>
      <TrainingPage trainingDate={new Date()} />
    </>
  )
}

export default App
