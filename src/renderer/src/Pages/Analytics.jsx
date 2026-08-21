import HomeButton from "../components/HomeButton"
import { getAllRegisters } from "../../services/dbcursor"
import { useEffect, useState } from "react"
import { Ban, CalendarDays, CircleX, FileText } from "lucide-react"

const actionModes = [
    { value: "Agendamento", label: "Agendamentos", icon: CalendarDays },
    { value: "Bloqueio", label: "Bloqueios", icon: Ban },
    { value: "Cancelamento", label: "Cancelamento", icon: CircleX },
]

function getRegisterDate(register) {
    if (!register.data) return 0

    const [day, month, year] = register.data.split("/")
    const [hour = 0, minute = 0] = (register.hora || "00:00").split(":")

    return new Date(year, month - 1, day, hour, minute).getTime()
}

export default function Analytics () {
    const [registers, setRegisters] = useState([])
    const [selectedAction, setSelectedAction] = useState("Agendamento")

    useEffect(() => {
        async function baixarLogs(){
            const dados = await getAllRegisters()
            setRegisters(dados)
        }

        baixarLogs()
    }, [])

    const selectedMode = actionModes.find((mode) => mode.value === selectedAction)
    const visibleRegisters = registers
        .filter((item) => item.tipoAcao === selectedAction)
        .sort((first, second) => getRegisterDate(second) - getRegisterDate(first))

    return(
        <div className="container analyticsPage">
            <HomeButton/>

            <main className="analyticsContent">
                <header className="analyticsHeader">
                    <div>
                        <span className="analyticsEyebrow">Central de registros</span>
                        <h1>Relatórios de atividade</h1>
                        <p>Consulte os eventos registrados por unidade e período.</p>
                    </div>
                    <div className="analyticsCount" aria-live="polite">
                        <strong>{visibleRegisters.length}</strong>
                        <span>registro{visibleRegisters.length === 1 ? "" : "s"}</span>
                    </div>
                </header>

                <nav className="analyticsTabs" aria-label="Filtrar registros por tipo de ação">
                    {actionModes.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            className={selectedAction === value ? "analyticsTab active" : "analyticsTab"}
                            type="button"
                            aria-pressed={selectedAction === value}
                            onClick={() => setSelectedAction(value)}
                        >
                            <Icon size={17} strokeWidth={2.2} />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>

                <section className="analyticsList" aria-live="polite">
                    {visibleRegisters.length > 0 ? visibleRegisters.map((item, index) => (
                        <article
                            className="analyticsRow"
                            key={`${item.data}-${item.hora}-${item.unidade}-${index}`}
                            tabIndex="0"
                        >
                            <div className="analyticsRowAccent" />
                            <div className="analyticsRowSummary">
                                <div className="analyticsRowDate">
                                    <strong>{item.hora || "--:--"}</strong>
                                    <span>{item.data || "Data não informada"}</span>
                                </div>
                                <div className="analyticsRowPerson">
                                    <strong>{item.agendadoPara || "Pessoa não informada"}</strong>
                                    <span>{selectedMode?.label}</span>
                                </div>
                                <div className="analyticsRowUnit">
                                    <span>Unidade</span>
                                    <strong>{item.unidade || "Não informada"}</strong>
                                </div>
                            </div>
                            <div className="analyticsRowDetails">
                                <dl className="analyticsDetails">
                                <div>
                                    <dt>Unidade</dt>
                                    <dd>{item.unidade || "Não informada"}</dd>
                                </div>
                                <div>
                                    <dt>Responsável</dt>
                                    <dd>{item.quemAgendou || "Não informado"}</dd>
                                </div>
                                </dl>
                            </div>
                        </article>
                    )) : (
                        <div className="analyticsEmpty">
                            <FileText size={30} strokeWidth={1.6} />
                            <h2>Nenhum registro encontrado</h2>
                            <p>Não existem {selectedMode?.label.toLowerCase()} registrados até o momento.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
