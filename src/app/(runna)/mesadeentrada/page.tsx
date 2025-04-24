import DemandaTable from "./ui/dataGrid";
import Header from "../../../components/Header";

export default function Page() {
  return (
    <>
      <Header type="demandas" />
      <div className="p-4 md:p-4">
        <DemandaTable />
      </div>
    </>
  )
}
