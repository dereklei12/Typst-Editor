import React from "react";
import SplitLayout from "./components/Layout/SplitLayout";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Typst 所见即所得编辑器</h1>
      </header>
      <SplitLayout />
    </div>
  );
}

export default App;
