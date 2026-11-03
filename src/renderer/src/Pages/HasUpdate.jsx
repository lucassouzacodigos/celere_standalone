
import "../assets/main.css"
import Spinner from "../components/Spinner"
import logo from '../assets/celerelogo.png'




export default function HasUpdate(){
    return(
        <div className='container'>

            <div className='displayCard' style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <img className='logo' src={logo} style={{width: 150, height: 150}} alt="" />

                <h1>Uma nova versão esta disponível</h1>
                <h3>o sistema sera atualizado em alguns instantes</h3>
                
                <div style={{marginTop:50}}>
                    <Spinner width={50} height={50} />
                </div>
            </div>


        </div>
    )
}