
import * as cheerio from 'cheerio'


async function getFilasPage() {
    const FAST_SessionId = await window.electron.getFastMedicSession();

    const url =
        "/celere.embudasartes/Pep/Fila/BuscaPainelPorFilaAcaoDestino";

    const dados = {
        session: FAST_SessionId
    };

    const filas = await window.electron.simplePostRequest(url, dados);

    const $ = cheerio.load(filas);

    const filasJson = [];

    $("tr.table-tr.pointer").each((index, element) => {
        const dataModel = $(element).attr("data-model");

        if (!dataModel) return;

        try {
        const fila = JSON.parse(dataModel);

        filasJson.push(fila);
        } catch (error) {
        console.error(
            `Erro ao converter data-model da fila ${index}:`,
            error
        );
        }
    });

    return filasJson;
}










async function getPacientesFila(dadosDaFila) {
    const fastSession = await window.electron.getFastMedicSession();

    dadosDaFila.session = fastSession;

    const url = "/celere.embudasartes/Pep/Fila/BuscaPainelPorFilaUsuario";

    const response = await window.electron.simplePostRequest(
        url,
        dadosDaFila
    );

    const dataModels = [];

    const inicioTag = 'data-model="';

    let posicao = 0;

    while (true) {
        const inicio = response.indexOf(inicioTag, posicao);

        if (inicio === -1) {
            break;
        }

        const inicioJson = inicio + inicioTag.length;

        let profundidade = 0;
        let dentroString = false;
        let escape = false;
        let fimJson = -1;

        for (let i = inicioJson; i < response.length; i++) {
            const char = response[i];

            if (escape) {
                escape = false;
                continue;
            }

            if (char === "\\") {
                escape = true;
                continue;
            }

            if (char === '"') {
                dentroString = !dentroString;
                continue;
            }

            if (dentroString) {
                continue;
            }

            if (char === "{") {
                profundidade++;
            }

            if (char === "}") {
                profundidade--;

                if (profundidade === 0) {
                    fimJson = i + 1;
                    break;
                }
            }
        }

        if (fimJson === -1) {
            break;
        }

        let dataModel = response.substring(
            inicioJson,
            fimJson
        );

        // Converte entidades HTML para aspas normais
        dataModel = dataModel.replace(/&quot;/g, '"');

        dataModels.push(dataModel);

        posicao = fimJson;
    }

    const pacientes = [];

    for (const dataModel of dataModels) {
        try {
            const paciente = JSON.parse(dataModel);

            pacientes.push(paciente);
        } catch (error) {
            console.error("DataModel:", dataModel);
            console.error("Erro ao converter JSON:", error);
        }
    }

    console.log("Data models encontrados:", dataModels.length);
    console.log("Pacientes encontrados:", pacientes.length);

    return pacientes;
}








async function tirarDaFila(dadosPacienteNaFila){
    const fastSession = await window.electron.getFastMedicSession();

    const url = "/celere.embudasartes/Pep/Fila/EncerrarFila"

    const dados = {
        "atendimento": {
            "CodFcesAtendimento": 238,
            "NumAtendimento": 35455,
            "SeqItemAtendimento": 2,
            "CodUsuario": 1,
            "CodAcaoDestino": 5
        },
        "motivo": "..........................",
        "codMotivoEncerramento": "1",
        "indSituacao": 1,
        "session": fastSession
        }

        const response = await window.electron.simplePostRequest(url, dados)

}



















export { getFilasPage, getPacientesFila, tirarDaFila }