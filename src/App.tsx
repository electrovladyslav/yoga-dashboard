import './App.css'
import { TrainingPage } from '@/pages/training-page/training-page.tsx';

function App() {

  return (
    <>
      <TrainingPage trainingDate={new Date()} />
    </>
  )
}

export default App
