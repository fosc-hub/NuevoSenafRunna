import LegajoTable from "./ui/legajos-table";
import Header from "../../../components/Header";
export default function Page() {
  return (
    <>
      <Header />
      <div className="p-4 md:p-4">
        <LegajoTable />
      </div>
    </>
  )
}

