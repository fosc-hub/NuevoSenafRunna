import type React from "react"

interface HeaderProps {
  type?: "demandas" | "legajos"
}

const Header: React.FC<HeaderProps> = ({ type }) => {
  // Determine the header text based on the type prop
  let headerText = "Bienvenido a "

  if (type === "demandas") {
    headerText += "Mesa de Entradas de Demandas"
  } else if (type === "legajos") {
    headerText += "Mesa de Entrada de Legajos"
  } else {
    headerText += "Mesa de Entradas"
  }

  return (
    <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">
        {headerText.split("Mesa de")[0]}
        <span className="text-sky-500">Mesa de{headerText.split("Mesa de")[1]}</span>
      </h1>
      <span className="text-gray-500">
        {new Date().toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
        })}{" "}
        |{" "}
        {new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  )
}

export default Header
