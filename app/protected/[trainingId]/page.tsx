import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

interface TrainingPageProps {
  params: Promise<{trainingId: string}>
}

const TrainingPage = async ({ params }: TrainingPageProps) => {
  const { trainingId } = await params;
  const supabase = await createClient();
  // Fetch the training details
  const { data: training, error: trainingError } = await supabase
    .from('trainings')
    .select(`
      id,
      name,
      exercises (
        id,
        name,
        sets (
          id,
          repetitions,
          weight
        )
      )
    `)
    .eq('id', trainingId)
    .single();

  if (trainingError || !training) {
    notFound(); // Show a 404 page if training is not found
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{training.name}</h1>

      {/* List Exercises */}
      <div className="mt-6 space-y-4">
        {training.exercises.length > 0 ? (
          training.exercises.map((exercise: any) => (
            <div key={exercise.id} className="p-4 border rounded-md">
              <h2 className="text-lg font-semibold">{exercise.name}</h2>

              {/* List Sets */}
              {exercise.sets.length > 0 ? (
                <table className="w-full mt-2 border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-2 py-1">Set</th>
                      <th className="border border-gray-300 px-2 py-1">
                        Repetitions
                      </th>
                      <th className="border border-gray-300 px-2 py-1">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set: any, index: number) => (
                      <tr key={set.id}>
                        <td className="border border-gray-300 px-2 py-1">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {set.repetitions}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {set.weight} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-2 text-gray-500">No sets recorded.</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No exercises recorded for this training.</p>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;
