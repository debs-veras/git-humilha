import getGitHubProfile from '@/services/github.service';
import useToastLoading from '@/hooks/useToastLoading';
import { useState } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const toast = useToastLoading();

  const loadUser = async () => {
    try {
      toast({ message: 'Buscando perfil...' });
      const response = await getGitHubProfile(userName);
      toast({
        message: `✅ Perfil carregado! ${response.repos.length} repositórios encontrados.`,
        type: 'success',
      });
      console.log(response);
    } catch (error: any) {
      toast({
        message: `❌ Erro: ${error.message}`,
        type: 'error',
      });
    }
  };

  return (
    <>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <button onClick={loadUser}>Load user</button>
    </>
  );
}
