






async function ping() {

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/CompartilhadoServer/Ping"

    const response = await window.electron.simplePostRequest(endpoint, {})

    return response
}

async function atualizaTempoEspera() {

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/Painel/Home/AtualizaLegendaTempoEspera"

    const response = await window.electron.simplePostRequest(endpoint, fastSession)
    return response
}

async function validaGrid() {

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/Painel/Home/ValidaGrid"
    const dados = {
        codPainel: 37,
        session: fastSession
    }

    const response = await window.electron.simplePostRequest(endpoint, dados)
    return response
}

async function atualizaChamadas() {

    const fastSession = await window.electron.getFastMedicSession();
    const endpoint = "/celere.embudasartes/Painel/Home/AtualizaChamadas"
    const dados = {
        codPainel: 37,
        session: fastSession,
        ultimalista: []
    }

    const response = await window.electron.simplePostRequest(endpoint, dados)
    // console.log("RAW", JSON.parse(JSON.parse(response)))
    return JSON.parse(JSON.parse(response))
}

async function falarPaciente(nome, sala) {
    const texto = `${nome},${sala}`;

    const resultado = await window.electron.falar(texto);

    if (!resultado.sucesso) {
        console.error(resultado.erro);
        return;
    }

    const blob = new Blob(
        [new Uint8Array(resultado.audio)],
        { type: "audio/mpeg" }
    );

    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);

    audio.onended = () => URL.revokeObjectURL(url);

    await audio.play();
}



export { ping, atualizaTempoEspera, validaGrid, atualizaChamadas, falarPaciente }