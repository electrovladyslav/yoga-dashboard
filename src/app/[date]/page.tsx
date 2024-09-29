import { TrainingPage } from '@/components/pages/training-page/training-page'

export default function Page({ params }: { params: { date: string } }) {
    let trainingDate = new Date(params.date);

    if (isNaN(trainingDate.getTime())) {
      trainingDate = new Date();
    }

    return <TrainingPage trainingDate={trainingDate} />
}