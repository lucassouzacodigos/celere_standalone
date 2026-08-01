import "../assets/main.css"
import casinha from '../assets/home.png'
import { useNavigate } from "react-router-dom"



export default function HomeButton() {

    const navigate = useNavigate()

    return(
        <div className='go-to-home-btn' onClick={() => navigate('/Home')}>
            <img className='casinha' src={casinha} alt="" />
        </div>
        )
}