import React from "react";
import "../../styles/tableView.css";

const TableView = ({ data }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Название показателя</th>
            <th>Дата анализа</th>
            <th>Значение показателя</th>
            <th>Единица измерения</th>
            <th>Референс</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                <td>{row.indicatorName}</td>
                <td>{row.analysisDate}</td>
                <td>{row.value}</td>
                <td>{row.unit}</td>
                <td>{row.reference}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                Нет данных для отображения
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
