

import mel from "../assets/mel.png"
import pedro from '../assets/pedro.png'


export default function EasterEggs(props){
    const nome = props.nome || ""
    return(

        <>
        {/* //PEDRO CAMARA */}
            {
                nome?.toLowerCase().includes("pedro camara") && 
                <div style={{color:"white", display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"row", height:"100%", width:"100%"}}>
                    <img src={mel} style={{height:200,width:200}}></img>
                    <p style={{fontSize:"81px"}}>♥</p>
                    <img src={pedro} style={{height:200,width:200}}></img>

                </div>
            }

            {
                nome?.toLowerCase().includes("lucas braga") && 
                <p style={{color:"white"}}>homem celere</p>
            }
        </>
    )
}