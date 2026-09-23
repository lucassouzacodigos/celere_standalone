
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

    const $ = cheerio.load(response);

    const pacientes = [];

    $("td#thNome").each((_, element) => {
        console.log(element.attribs);
        pacientes.push($(element).text().trim());
    });
    console.log(pacientes);
    return pacientes;
}




export { getFilasPage, getPacientesFila }