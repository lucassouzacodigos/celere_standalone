import { useEffect, useState } from 'react'
import * as scripts from '../../../main/scripts/scripts.js'
import { useNavigate } from 'react-router-dom'


function Home() {
	const ipcHandle = () => window.electron.ipcRenderer.send('ping')
	const navigate = useNavigate()
	
	const [teste, setTeste] = useState()
	const [dados, setDados] = useState()
	const [FAST_SessionId, setFAST_SessionId] = useState("")
	const getDadosLogin = async () => {
		const response = await window.electron.dadosLogin()
		const FAST_SessionId = await window.electron.getFastMedicSession()
		setDados(response)
		setFAST_SessionId(FAST_SessionId)
	}
	
	function getFastMedicSession() {
		window.electron.getFastMedicSession()
	}
	
	
	async function buscarProfissional() {
		const dados = {
			nomeProfissional: "andreia ast",
			conselho: "",
			numCNS: "",
			numCPF: "",
			idQuery: 8,
			sglOrgao: null,
			codGrupoEspecialidade: null,
			session: FAST_SessionId
		}
		
		const response = await window.electron.buscarProfissional(dados)
		setTeste(response)
		console.log(response)
	}
	
	const openLoginPage = () => {
		window.electron.openLoginPage()
	}
	
	const consoleLogCookies = () => {
		window.electron.consoleLogCookies()
	}

	
	
	useEffect(() => {
		getDadosLogin()
	}, [])
	
	
	
	
	
	return (
		<div className="container">

		<div className='go-to-home-btn' onClick={() => navigate('/Home')}></div>
		
		<div className="mainmenu flex-center">
		
		<button onClick={openLoginPage}>Login</button>
		<button onClick={scripts.consoleLogCookies}>Cookies</button>
		<button onClick={getDadosLogin}>Atualizar Sessao</button>
		<button onClick={scripts.teste}>aaaaaaa</button>
		<button onClick={() => console.log(dados)}>Dados Login</button>
		<button onClick={getFastMedicSession}>sessionID</button>
		<button onClick={buscarProfissional}>Buscar Profissional</button>
		<button onClick={() => navigate('/ConsultarAgendas')}>Consultar Agendas</button>
		</div>
		
		<div dangerouslySetInnerHTML={{ __html: teste || "a" }}>
		
		</div>
		</div>
	)
}

export default Home



/// só anotando, o metode de buscar ids de profissional, sera pelo link,
///  consulta agenda, ao carregar a pagina ele da todos os profissionais com agendas criadas
/// e seus respectivos ids
/// ja usuarios, tera q ser pela pesquisa da recepcao

// get agendas https://sistema.saudepublica.digital/celere.embudasartes/Pep/Agenda/ConsultaAgendamentoInicialToMaster