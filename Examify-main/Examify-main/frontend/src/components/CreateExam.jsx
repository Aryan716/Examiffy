/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CreateExam = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const handleChangeQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleChangeOption = (index, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleChangeAnswer = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/exams", { title, timeLimit, questions });

      alert("Exam created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Exam</h2>
      <input
        type="text"
        placeholder="Exam Title"
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 p-2 mb-4 w-full"
        required
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="180"
          value={timeLimit}
          onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
          className="border border-gray-300 p-2 w-full"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter time limit in minutes (1-180 minutes)
        </p>
      </div>
      {questions.map((q, index) => (
        <div key={index} className="mb-4">
          <input
            type="text"
            placeholder="Question"
            onChange={(e) => handleChangeQuestion(index, e.target.value)}
            className="border border-gray-300 p-2 mb-2 w-full"
            required
          />
          {q.options.map((option, optionIndex) => (
            <input
              key={optionIndex}
              type="text"
              placeholder={`Option ${optionIndex + 1}`}
              onChange={(e) =>
                handleChangeOption(index, optionIndex, e.target.value)
              }
              className="border border-gray-300 p-2 mb-2 w-full"
              required
            />
          ))}
          <input
            type="text"
            placeholder="Correct Answer"
            onChange={(e) => handleChangeAnswer(index, e.target.value)}
            className="border border-gray-300 p-2 mb-2 w-full"
            required
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="bg-blue-600 text-white p-2 mr-3 rounded mb-4"
      >
        Add Question
      </button>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Create Exam
      </button>
    </form>
  );
};

export default CreateExam;
