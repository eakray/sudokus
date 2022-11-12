import "./Sudoku.css";
import { useEffect, useState } from "react";

const encodeBoard = (board) =>
    board.reduce(
        (result, row, i) =>
            result +
            `%5B${encodeURIComponent(row)}%5D${
                i === board.length - 1 ? "" : "%2C"
            }`,
        ""
    );

const encodeParams = (params) =>
    Object.keys(params)
        .map((key) => key + "=" + `%5B${encodeBoard(params[key])}%5D`)
        .join("&");

function Sudoku() {
    const [board, setBoard] = useState([[]]);
    const [validate, setValidate] = useState(false);
    const [solved, setSolved] = useState([[]]);

    useEffect(() => {
        fetch("https://sugoku.herokuapp.com/board?difficulty=easy").then(
            (data) => {
                if (data.status === 200) {
                    data.json().then((data) => {
                        setBoard(data.board);
                    });
                }
            }
        );
    }, []);

    useEffect(() => {
        console.log(encodeParams({ board: board }));
        fetch("https://sugoku.herokuapp.com/solve", {
            method: "POST",
            body: encodeParams({ board: board }),
            headers: { "Content-Type": "application/x-www-form=urlencoded" },
        })
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                console.log("solved", data.solution);
                setSolved(data.solution);
            })
            .catch(console.warn);
    }, [validate]);

    const handleCellSubmit = (r, c, v) => {
        let n = [...board];
        n[c][r] = parseInt(v);
        setBoard(n);
    };
    return (
        <div className="board">
            {board.map((column, columnIndex) => {
                return (
                    <div className="column">
                        {column.map((cell, rowIndex) => {
                            let v =
                                board[rowIndex][columnIndex] === 0
                                    ? ""
                                    : board[rowIndex][columnIndex];
                            return (
                                <div className="cell">
                                    <input
                                        className="cell-input"
                                        value={v}
                                        onChange={(event) =>
                                            handleCellSubmit(
                                                columnIndex,
                                                rowIndex,
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            <button
                type="button"
                onClick={() => {
                    setValidate(!validate);
                }}
            >
                Validate
            </button>
        </div>
    );
}

export default Sudoku;
