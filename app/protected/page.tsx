import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const { data: trainings, error } = await supabase
  .from('trainings')
  .select('*');

  if (error || trainings == null) {
    console.log(error)
    return <div>Error loading trainings</div>
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <Button>
        <Link href="/protected/new">
          Crear nuevo entrenamiento
        </Link>
      </Button>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className='bg-background'>
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Creado</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Ver Más</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map((training) => (
            <tr key={training.id}>
              <td className="border border-gray-300 px-4 py-2">{training.id}</td>
              <td className="border border-gray-300 px-4 py-2">{training.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(training.created_at).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Button>
                  <Link href={`/protected/${training.id}`}>
                    Ver
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
