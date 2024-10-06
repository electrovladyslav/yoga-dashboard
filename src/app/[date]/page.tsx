import { TrainingPage } from '@/components/pages/training-page/training-page'

export default function Page({ params }: { params: { date: string } }) {
    const urlDate = new Date(params.date);
    const isUrlDateValid = !isNaN(urlDate.getTime());

  return isUrlDateValid ?
    <TrainingPage trainingDate={urlDate} /> :
    <TrainingPage />;
}