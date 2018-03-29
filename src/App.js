import React from "react";
import _ from "lodash";

var possibleCombinationSum = (arr, n) => {
  if (arr.indexOf(n) >= 0) {
    return true;
  }
  if (arr[0] > n) {
    return false;
  }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }

  var listSize = arr.length,
    combinationsCount = 1 << listSize;
  for (var i = 1; i < combinationsCount; i++) {
    var combinationSum = 0;
    for (var j = 0; j < listSize; j++) {
      if (i & (1 << j)) {
        combinationSum += arr[j];
      }
      if (n === combinationSum) {
        return true;
      }
    }
  }
  return false;
};

const Stars = props => {
  return (
    <div className="col-5">
      {_.range(props.numberOfStars).map(i => (
        <i className="fa fa-star" key={i} />
      ))}
    </div>
  );
};

const Button = props => {
  let button;
  switch (props.answerIsCorrect) {
    case true:
      button = (
        <button className="btn btn-success" onClick={props.acceptAnswer}>
          {" "}
          <i className="fa fa-check" />
        </button>
      );
      break;
    case false:
      button = (
        <button className="btn btn-danger">
          {" "}
          <i className="fa fa-times" />
        </button>
      );
      break;
    default:
      button = (
        <button
          className="btn"
          onClick={props.checkAnswer}
          disabled={props.selectedNumbers.length === 0}
        >
          =
        </button>
      );
  }
  return (
    <div className="col-2 text-center">
      {button}
      <br />
      <br />
      <div>
        <button
          className="btn btn-warning btn-sm"
          onClick={props.redraw}
          disabled={props.redraws === 0}
        >
          <i className="fa fa-refresh" /> {props.redraws}{" "}
        </button>
      </div>
    </div>
  );
};

const Answer = props => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map((number, i) => (
        <span key={i} onClick={() => props.unselectedNumber(number)}>
          {number}
        </span>
      ))}
    </div>
  );
};

const Numbers = props => {
  const numberClassName = number => {
    if (props.usedNumbers.indexOf(number) >= 0) {
      return "used";
    }
    if (props.selectedNumbers.indexOf(number) >= 0) {
      return "selected";
    }
  };

  // selectedNumber = () => {

  // }

  return (
    <div className="card text-center">
      <div>
        {Numbers.list.map((number, i) => (
          <span
            key={i}
            className={numberClassName(number)}
            onClick={() => props.selectedNumber(number)}
          >
            {number}
          </span>
        ))}
      </div>
    </div>
  );
};
Numbers.list = _.range(1, 10);

const DoneFrame = props => {
  return (
    <div className="text-center">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-secondary" onClick={props.resetGame}>
        Play Again.
      </button>
    </div>
  );
};

class Game extends React.Component {
  static randomNumber = () => 1 + Math.floor(Math.random() * 9);
  static initialState = () => ({
    selectedNumbers: [],
    numberOfStars: Game.randomNumber(),
    usedNumbers: [],
    answerIsCorrect: null,
    redraws: 5,
    doneStatus: null
  });
  state = Game.initialState();

  resetGame = () => this.setState(Game.initialState());

  selectedNumber = clickedNumber => {
    if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
      return;
    }
    if (this.state.usedNumbers.indexOf(clickedNumber) >= 0) {
      return;
    }
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
      // usedNumbers: prevState.usedNumbers.concat(clickedNumber)
    }));
  };

  unselectedNumber = clickedNumber => {
    this.setState(prevState => ({
      selectedNumbers: prevState.selectedNumbers.filter(
        number => number !== clickedNumber
      ),
      answerIsCorrect: null
    }));
  };

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect:
        prevState.numberOfStars ===
        prevState.selectedNumbers.reduce((a, b) => a + b, 0)
    }));
  };

  acceptAnswer = () => {
    this.setState(
      prevState => ({
        usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
        selectedNumbers: [],
        answerIsCorrect: null,
        numberOfStars: Game.randomNumber()
      }),
      this.updateDoneStatus
    );
  };

  redraw = () => {
    if (this.state.redraws === 0) {
      return;
    }
    this.setState(
      prevState => ({
        numberOfStars: Game.randomNumber(),
        answerIsCorrect: null,
        selectedNumbers: [],
        redraws: prevState.redraws - 1
      }),
      this.updateDoneStatus
    );
  };

  possibleSolutions = ({ numberOfStars, usedNumbers }) => {
    const possibleNumbers = _.range(1, 10).filter(
      number => usedNumbers.indexOf(number) === -1
    );
    return possibleCombinationSum(possibleNumbers, numberOfStars);
  };

  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9) {
        return { doneStatus: "Done. Nice!" };
      }
      if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
        return { doneStatus: "Game Over!" };
      }
    });
  };
  render() {
    const {
      selectedNumbers,
      numberOfStars,
      answerIsCorrect,
      usedNumbers,
      redraws,
      doneStatus
    } = this.state;
    return (
      <div className="container">
        <h3>Play Nine</h3>
        <hr />
        <div className="row">
          <Stars numberOfStars={doneStatus ? 0 : numberOfStars} />
          <Button
            selectedNumbers={selectedNumbers}
            redraws={redraws}
            checkAnswer={this.checkAnswer}
            acceptAnswer={this.acceptAnswer}
            answerIsCorrect={answerIsCorrect}
            redraw={this.redraw}
          />
          <Answer
            selectedNumbers={selectedNumbers}
            unselectedNumber={this.unselectedNumber}
          />
        </div>
        <br />
        {doneStatus ? (
          <DoneFrame doneStatus={doneStatus} resetGame={this.resetGame} />
        ) : (
          <Numbers
            selectedNumbers={selectedNumbers}
            selectedNumber={this.selectedNumber}
            usedNumbers={usedNumbers}
          />
        )}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Game />
      </div>
    );
  }
}

export default App;
