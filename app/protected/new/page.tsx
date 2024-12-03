'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

const trainingSchema = z.object({
  name: z.string().min(1, 'El nombre del entrenamiento es obligatorio'),
  exercises: z.array(
    z.object({
      name: z.string().min(1, 'El nombre del ejercicio es obligatorio'),
      sets: z.array(
        z.object({
          repetitions: z.number().min(1, 'Debe ser al menos 1 repetición'),
          weight: z.number().min(0, 'El peso debe ser positivo'),
        })
      ).min(1, 'Debes agregar al menos una serie'),
    })
  ).min(1, 'Debes agregar al menos un ejercicio'),
});

type TrainingForm = z.infer<typeof trainingSchema>;

export default function TrainingForm() {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      name: '',
      exercises: [
        { name: '', sets: [{ repetitions: 0, weight: 0 }] },
      ],
    },
  });

  const { fields: exerciseFields, append: addExercise, remove: removeExercise } =
    useFieldArray({
      control,
      name: 'exercises',
    });

  const handleSave = async (data: TrainingForm) => {
    console.log('here')
    const supabase = createClient();
    const { data: training, error: trainingError } = await supabase
      .from('trainings')
      .insert({ name: data.name })
      .select();

    if (trainingError || !training) {
      console.error('Error creating training:', trainingError);
      return;
    }

    const trainingId = training[0].id;

    for (const exercise of data.exercises) {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({ training_id: trainingId, name: exercise.name })
        .select();

      if (exerciseError || !exerciseData) {
        console.error('Error creating exercise:', exerciseError);
        return;
      }

      const exerciseId = exerciseData[0].id;

      const { error: setsError } = await supabase.from('sets').insert(
        exercise.sets.map((set) => ({
          exercise_id: exerciseId,
          repetitions: set.repetitions,
          weight: set.weight,
        }))
      );

      if (setsError) {
        console.error('Error creating sets:', setsError);
        return;
      }
    }

    alert('Entrenamiento guardado exitosamente');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
      {/* Training Name */}
      <div>
        <Label htmlFor="name">Training Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      {/* Exercises */}
      {exerciseFields.map((exercise, exerciseIndex) => (
        <div key={exercise.id} className="border p-4">
          {/* Exercise Name */}
          <Label htmlFor={`exercises.${exerciseIndex}.name`}>
            Exercise Name
          </Label>
          <Input
            id={`exercises.${exerciseIndex}.name`}
            {...register(`exercises.${exerciseIndex}.name`)}
          />
          {errors.exercises?.[exerciseIndex]?.name && (
            <p className="text-red-500">
              {errors.exercises[exerciseIndex].name?.message}
            </p>
          )}

          <Button
            type="button"
            onClick={() => removeExercise(exerciseIndex)}
            className="mt-2"
          >
            Remove Exercise
          </Button>

          {/* Sets */}
          <div className="mt-4">
            <Label>Sets</Label>
            {exercise.sets?.map((_, setIndex) => (
              <div key={setIndex} className="flex space-x-4 items-center">
                {/* Repetitions */}
                <div>
                  <Input
                    type="number"
                    placeholder="Repetitions"
                    {...register(
                      `exercises.${exerciseIndex}.sets.${setIndex}.repetitions`,
                      { valueAsNumber: true }
                    )}
                  />
                  {errors.exercises?.[exerciseIndex]?.sets?.[setIndex]
                    ?.repetitions && (
                    <p className="text-red-500">
                      {
                        errors.exercises[exerciseIndex].sets[setIndex]
                          .repetitions?.message
                      }
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <Input
                    type="number"
                    placeholder="Weight"
                    {...register(
                      `exercises.${exerciseIndex}.sets.${setIndex}.weight`,
                      { valueAsNumber: true }
                    )}
                  />
                  {errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.weight && (
                    <p className="text-red-500">
                      {
                        errors.exercises[exerciseIndex].sets[setIndex].weight
                          ?.message
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button type="button" onClick={() => addExercise({ name: '', sets: [] })}>
        Add Exercise
      </Button>

      <Button type="submit" className="mt-4">
        Save Training
      </Button>
    </form>
  );
}