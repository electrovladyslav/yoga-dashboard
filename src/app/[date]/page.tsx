import { TrainingPage } from '@/components/pages/training-page/training-page'

export default function Page({ params }: { params: { date: string } }) {
    console.log(params.date)
    return <TrainingPage trainingDate={new Date()} />
  }