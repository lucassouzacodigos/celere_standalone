import { useEffect, useState } from 'react'
import * as scripts from '../../../main/scripts/scripts.js'
import { useNavigate } from 'react-router-dom'
import HomeButton from '../components/HomeButton.jsx'
import Spinner from '../components/Spinner.jsx'
import splash from '../assets/celeresplash2.gif'


function Home() {

	const ipcHandle = () => window.electron.ipcRenderer.send('ping')
	const navigate = useNavigate()
	
	const [teste, setTeste] = useState()
	const [dados, setDados] = useState()
	const [nome, setNome] = useState()
	const [ocupacao, setOcupacao] = useState()
	const [unidade, setUnidade] = useState()
	const [subModulo, setSubModulo] = useState()
	const [version, setVersion] = useState()


	const [FAST_SessionId, setFAST_SessionId] = useState("")
	const getDadosLogin = async () => {
		const response = await window.electron.dadosLogin()
		const FAST_SessionId = await window.electron.getFastMedicSession()
		setDados(response)
		console.log(response)
		setFAST_SessionId(FAST_SessionId)

		if (response){
			const [nome, ocupacao] = response[0]
			.replace("Bem vindo ", "")
			.split(":")

			const unidade = response[1].replace("Estabelecimento: ", "")

			setNome(nome.trim())
			setOcupacao(ocupacao.trim())
			setUnidade(unidade.trim())
			console.log("setos ocoorios")
		} else {
			setNome("")
			setOcupacao("")
			setUnidade("")
		}
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
	
	const openLoginPage = async () => {
		if (dados) {
			limparCache()
		}

		window.electron.openLoginPage()
	}
	
	const consoleLogCookies = () => {
		window.electron.consoleLogCookies()
	}

	const limparCache = async () => {
		const confirm = await window.electron.limparCache()
		if (confirm) {
        setDados(null)
        setNome("")
        setOcupacao("")
        setUnidade("")
        setFAST_SessionId("")

    	}
	}

	
	
	useEffect(() => {
		window.electron.sendDadosUnidade(async(dados) => {
			await getDadosLogin()
			const [nome, ocupacao] = dados[0]
			.replace("Bem vindo ", "")
			.split(":")

			const unidade = dados[1].replace("Estabelecimento: ", "")

			setNome(nome.trim())
			setOcupacao(ocupacao.trim())
			setUnidade(unidade.trim())

		})
		async function getVersion() {
			let version = await window.electron.getVersion()
			setVersion(version)
		}
		getVersion()
	}, [ocupacao])
	
	
	
	
	
	return (
		<div className="container">

			<HomeButton/>
			
			<div className="mainmenu flex-center">



				{dados ? 
					<div className="infoBox flex-center">
						<p> <span style={{color: "black"}}>Usuário: </span>{nome || ""} </p>
						<p> <span style={{color: "black"}}>Ocupação: </span>{ocupacao || ""} </p>
						<p> <span style={{color: "black"}}>Unidade: </span>{unidade || ""} </p>
						<p> <span style={{color: "black"}}>Módulo: </span>{dados?.[2].replace("SubMódulo: ", "")} </p>
					</div>
				: 
					<div className="infoBox flex-center" style={{backgroundColor: "#0a0a0a", flexDirection: "row", justifyContent: "start"}} >
					<Spinner/>
					<p style={{marginLeft: "10px"}}>Aguardando Login</p>
					</div>
				}

				<img src={splash} style={{width: 300, height: "auto", position:"absolute", top: "50%", left: "50%", transform: "translate(-50%, -70%)"}}></img>
			
				{/* <button onClick={scripts.consoleLogCookies}>Cookies</button>
				<button onClick={getDadosLogin}>Atualizar Sessao</button>
				<button onClick={scripts.teste}>aaaaaaa</button>
				<button onClick={() => console.log(dados)}>Dados Login</button>
				<button onClick={getFastMedicSession}>sessionID</button>
				<button onClick={buscarProfissional}>Buscar Profissional</button>
				<button onClick={() => navigate('/testandopesquisa')}>Barra de pesquisa WIP</button> */}
				<button onClick={openLoginPage}>{dados? "Atualizar Login" : "Login"}</button>
				<button onClick={() => navigate('/ConsultarAgendas')}>Agendar consultas</button>
				{nome?.toLowerCase().includes("celere") && <button className='analyticsBtn' onClick={() => navigate('/Analytics')}>Relatorios</button>}

				<div className='patchNotes'>

					<p>Notas da Versão</p>
					<p>v{version}_public</p>
					<p style={{textAlign:"start"}}>Aba de Relatorios foi adicionada</p>
					
				</div>


				
		
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