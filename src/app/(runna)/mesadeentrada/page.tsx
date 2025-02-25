import DemandaTable from "./ui/dataGrid";
import Header from "./ui/Header";

export default function Page() {
  return (
    <>
      <Header />
      <div className="p-4 md:p-4">
        <DemandaTable />
      </div>
    </>
  )
}

