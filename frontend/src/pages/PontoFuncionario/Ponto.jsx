import '../PontoFuncionario/estilo/ponto.css'
import {useState} from 'react';
import api from '../../services/api';

export default function PontoFuncionario(){

    const[cpf,setCpf] = useState('');
    const[senhaponto,setSenhaponto] = useState('');
    
    const handleSubmit = async (e) =>{
        e.preventDefault();

        try{
            const resposta = await api.post('/ponto',{
                cpf,
                senha: senhaponto
            });
                console.log(resposta.data);
        }catch(error){
            console.error('Erro ao registrar o ponto:',error)
        }

    }

    return(
        <div className="formulario" onSubmit={handleSubmit}>
            <form>
            <h2>Registro de Ponto</h2>
            Digite seu CPF:<input type="text" value={cpf} onChange={e => setCpf(e.target.value)} required></input>
            Digite sua Senha:<input type="password" value={senhaponto} onChange={e => setSenhaponto(e.target.value)} required></input>
            <button type="submit">Enviar</button>
            </form>
        </div>
    )
}