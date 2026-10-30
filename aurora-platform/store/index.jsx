import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import annotationReducer from "./annotationSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    annotation: annotationReducer,
    ui: uiReducer,
  },
});

export const useAppDispatch = () => useDispatch();

export const useAppSelector = useSelector;
