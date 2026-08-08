import "../assets/main.css"

import HomeButton from '../components/HomeButton'


export default function Testandopesquisa () {


    return(
        <div className='container flex-center'>

            <HomeButton />

            <input type="text" className="general-input" />
        </div>
    )
}