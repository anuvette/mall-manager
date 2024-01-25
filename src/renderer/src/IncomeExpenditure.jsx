import IncomeTable from "./IncomeTable";
import ExpenditureTable from "./ExpenditureTable";
import "./assets/IncomeExpenditure.css";

const IncomeExpenditure = () =>
{
    return(
        <>
            <div className="income-expenditure-mother-container">
                <h1>Income & Expenditure</h1>
                <div className="income-expenditure-table-container">
                    <IncomeTable/>
                    <ExpenditureTable/>
                </div>
            </div>
        </>
    );
};

export default IncomeExpenditure;