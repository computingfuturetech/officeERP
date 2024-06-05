import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import {
  showSuccessToastMessage,
  showErrorToastMessage,
} from "../components/toastUtils";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        email: email.toLowerCase(),
      };
      
      localStorage.setItem("email", email);

      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/user/forgetPassword",
        data
      );
      if (response.status === 200) {

        showSuccessToastMessage("OTP sent successfully!");
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = "/otp";
        }, 2000);
      } else {
        setIsLoading(false);
        showErrorToastMessage("Something went wrong!");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      showErrorToastMessage("Something went wrong!", error);
    }
  };

  return (
    <div className="right">
      <div className={`content ${isLoading ? "loading" : ""}`}>
        <img src="data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 220 62' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3Cg%3E%3Cg%3E%3Cpath d='M0,61.655l0,-53.652c0,-4.401 3.601,-8.003 8.003,-8.003l53.223,0c4.4,0 8,3.602 8,8.003l-0,53.221c-0,0.133 -0.004,0.265 -0.01,0.397l-11.053,-10.93c-0.899,-0.89 -2.399,-1.337 -3.329,-0.99c-0.935,0.346 -2.361,-0.165 -3.166,-1.133l-13.061,-15.685c-0.802,-0.97 -2.134,-0.973 -2.944,-0.01l-10.922,12.972c-0.814,0.965 -2.328,1.161 -3.365,0.442l-2.628,-1.836c-1.037,-0.727 -2.546,-0.523 -3.36,0.447l-1.517,1.81c-0.809,0.966 -1.978,1.761 -2.589,1.758c-0.613,-0.002 -1.791,0.783 -2.612,1.742l-8.67,11.447Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M38.654,36.235c-0.809,-0.975 -2.125,-0.973 -2.932,0.002l-8.376,10.13c-0.807,0.972 -0.667,1.114 0.315,0.314l2.553,-2.082c0.977,-0.8 2.335,-1.346 3.017,-1.211c0.676,0.128 1.637,-0.152 2.134,-0.63c0.492,-0.48 1.82,-0.411 2.951,0.152l3.166,1.585c1.126,0.568 1.836,0.286 1.566,-0.62c-0.263,-0.906 -0.263,-1.67 0.002,-1.696c0.27,-0.026 -0.172,-0.847 -0.977,-1.815l-3.419,-4.129Z' style='fill:%23fff;fill-rule:nonzero;'/%3E%3Cpath d='M50.683,51.374c-0.757,-0.895 -1.022,-0.992 -0.582,-0.218c0.443,0.774 0.587,3.862 1.455,4.02c0.867,0.163 1.96,0.625 2.426,1.025c0.468,0.397 1.225,0.541 1.696,0.314c0.464,-0.224 1.839,-0.109 3.046,0.258l1.665,0.511c1.21,0.362 1.458,-0.056 0.554,-0.939l-2.87,-2.804c-0.906,-0.887 -2.418,-1.379 -3.365,-1.1c-0.946,0.281 -1.928,0.52 -2.184,0.532c-0.251,0.012 -1.083,-0.707 -1.841,-1.599' style='fill:%23fff;fill-rule:nonzero;'/%3E%3Cpath d='M19.461,47.522c-1.034,-0.734 -2.544,-0.545 -3.367,0.419l-0.994,1.159c-0.816,0.961 -2.103,1.746 -2.849,1.744c-0.747,-0 -2.039,0.776 -2.872,1.725l-1.482,1.687c-0.837,0.949 -0.615,1.216 0.481,0.594l0.369,-0.208c1.1,-0.618 2.371,-1.11 2.825,-1.082c0.45,0.026 1.593,-0.646 2.527,-1.49l0.133,-0.121c0.939,-0.847 2.001,-1.306 2.361,-1.032c0.36,0.284 1.013,0.13 1.451,-0.338c0.444,-0.464 1.72,-0.79 2.839,-0.722c1.122,0.064 1.195,-0.478 0.166,-1.209l-1.588,-1.126Z' style='fill:%23fff;fill-rule:nonzero;'/%3E%3C/g%3E%3Cg%3E%3Cpath d='M98.412,57.382c-1.597,0.843 -3.585,1.265 -5.964,1.265c-3.072,-0 -5.532,-0.989 -7.379,-2.967c-1.847,-1.978 -2.771,-4.573 -2.771,-7.786c0,-3.453 1.039,-6.244 3.117,-8.373c2.079,-2.128 4.714,-3.192 7.907,-3.192c2.048,-0 3.744,0.296 5.09,0.888l-0,2.696c-1.546,-0.863 -3.253,-1.295 -5.121,-1.295c-2.479,-0 -4.49,0.828 -6.031,2.485c-1.541,1.656 -2.311,3.87 -2.311,6.641c-0,2.63 0.72,4.726 2.161,6.287c1.44,1.561 3.33,2.342 5.669,2.342c2.169,-0 4.046,-0.482 5.633,-1.446l-0,2.455Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M120.757,58.285l-3.012,0l-3.614,-6.054c-0.331,-0.562 -0.653,-1.041 -0.964,-1.438c-0.311,-0.396 -0.63,-0.72 -0.956,-0.971c-0.326,-0.251 -0.678,-0.434 -1.054,-0.55c-0.377,-0.115 -0.801,-0.173 -1.273,-0.173l-2.078,0l0,9.186l-2.53,0l0,-21.595l6.446,0c0.943,0 1.814,0.118 2.612,0.354c0.798,0.236 1.491,0.595 2.078,1.077c0.588,0.482 1.047,1.082 1.378,1.799c0.332,0.718 0.497,1.559 0.497,2.523c0,0.753 -0.113,1.443 -0.338,2.071c-0.226,0.627 -0.548,1.187 -0.964,1.679c-0.417,0.492 -0.919,0.911 -1.506,1.257c-0.588,0.346 -1.248,0.615 -1.98,0.806l-0,0.06c0.361,0.161 0.675,0.344 0.941,0.55c0.266,0.205 0.519,0.449 0.76,0.73c0.241,0.281 0.48,0.6 0.716,0.956c0.235,0.357 0.499,0.771 0.79,1.243l4.051,6.49Zm-12.951,-19.306l0,7.831l3.434,0c0.632,0 1.217,-0.095 1.754,-0.286c0.537,-0.191 1.001,-0.464 1.393,-0.821c0.392,-0.356 0.698,-0.793 0.919,-1.31c0.22,-0.517 0.331,-1.097 0.331,-1.739c-0,-1.155 -0.374,-2.056 -1.122,-2.703c-0.748,-0.648 -1.83,-0.972 -3.245,-0.972l-3.464,0Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M148.208,58.285l-2.515,0l-0,-14.487c-0,-1.144 0.07,-2.545 0.211,-4.201l-0.061,-0c-0.241,0.974 -0.456,1.671 -0.647,2.093l-7.379,16.595l-1.235,0l-7.364,-16.475c-0.211,-0.481 -0.427,-1.219 -0.648,-2.213l-0.06,-0c0.08,0.863 0.121,2.274 0.121,4.231l-0,14.457l-2.44,0l0,-21.595l3.343,0l6.626,15.059c0.512,1.155 0.844,2.018 0.994,2.591l0.09,-0c0.432,-1.185 0.779,-2.068 1.04,-2.651l6.761,-14.999l3.163,0l-0,21.595Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M178.713,58.285l-11.445,0l-0,-21.595l10.963,0l-0,2.289l-8.433,0l-0,7.184l7.8,-0l0,2.273l-7.8,0l-0,7.56l8.915,0l-0,2.289Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M200.817,58.285l-3.012,0l-3.614,-6.054c-0.331,-0.562 -0.652,-1.041 -0.964,-1.438c-0.311,-0.396 -0.63,-0.72 -0.956,-0.971c-0.326,-0.251 -0.677,-0.434 -1.054,-0.55c-0.376,-0.115 -0.801,-0.173 -1.272,-0.173l-2.079,0l0,9.186l-2.53,0l0,-21.595l6.446,0c0.943,0 1.814,0.118 2.613,0.354c0.798,0.236 1.49,0.595 2.078,1.077c0.587,0.482 1.046,1.082 1.378,1.799c0.331,0.718 0.497,1.559 0.497,2.523c-0,0.753 -0.113,1.443 -0.339,2.071c-0.226,0.627 -0.547,1.187 -0.964,1.679c-0.417,0.492 -0.919,0.911 -1.506,1.257c-0.587,0.346 -1.247,0.615 -1.98,0.806l-0,0.06c0.361,0.161 0.675,0.344 0.941,0.55c0.266,0.205 0.52,0.449 0.76,0.73c0.241,0.281 0.48,0.6 0.716,0.956c0.236,0.357 0.499,0.771 0.79,1.243l4.051,6.49Zm-12.951,-19.306l0,7.831l3.434,0c0.632,0 1.217,-0.095 1.754,-0.286c0.537,-0.191 1.002,-0.464 1.393,-0.821c0.392,-0.356 0.698,-0.793 0.919,-1.31c0.221,-0.517 0.331,-1.097 0.331,-1.739c0,-1.155 -0.374,-2.056 -1.122,-2.703c-0.748,-0.648 -1.829,-0.972 -3.245,-0.972l-3.464,0Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cpath d='M208.781,50.123l0,8.162l-2.53,0l0,-21.595l5.934,0c2.309,0 4.098,0.562 5.368,1.687c1.27,1.124 1.905,2.711 1.905,4.759c0,2.048 -0.705,3.724 -2.116,5.029c-1.41,1.306 -3.315,1.958 -5.715,1.958l-2.846,0Zm0,-11.144l0,8.855l2.651,0c1.747,0 3.079,-0.399 3.998,-1.197c0.918,-0.798 1.378,-1.925 1.378,-3.381c-0,-2.851 -1.687,-4.277 -5.06,-4.277l-2.967,0Z' style='fill:%230050c8;fill-rule:nonzero;'/%3E%3Cg%3E%3Cpath d='M86.798,29.258l-4.812,-0l-0,-19.25l4.812,-0l-0,19.25Zm-0,-22.314l-4.812,0l-0,-3.935l4.812,0l-0,3.935Z' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3Cpath d='M101.622,24.886c5.428,0 8.14,-3.078 8.14,-9.465c-0,-5.439 -2.712,-8.04 -8.14,-8.04l-5.193,0l-0,17.505l5.193,0Zm-10.008,4.372l0,-26.25l10.008,0c8.659,0 12.991,4.173 12.991,12.413c0,9.194 -4.332,13.837 -12.991,13.837l-10.008,-0Z' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3Cpath d='M118.309,18.945l-0,-15.937l4.818,0l-0,15.937c-0,4.169 2.293,6.253 6.562,6.253c4.269,-0 6.566,-2.084 6.566,-6.253l-0,-15.937l4.812,0l0,15.937c0,6.973 -3.877,10.46 -11.378,10.46c-7.501,0 -11.38,-3.487 -11.38,-10.46' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3Cpath d='M145.883,29.258l0,-26.249l11.984,-0c5.345,-0 8.013,2.366 8.013,7.035c0,3.158 -2.078,5.806 -6.239,7.881l8.288,11.333l-6.106,-0l-8.059,-11.427l-0,-2.217c4.812,-0.791 6.999,-2.562 6.999,-5.368c-0,-1.928 -1.036,-2.865 -3.207,-2.865l-6.421,-0l-0,21.877l-5.252,-0Z' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3Cpath d='M172.53,29.258l-4.975,-0l11.107,-26.249l5.214,-0l11.342,26.249l-5.213,-0l-2.983,-7l-8.689,-0l1.664,-4.373l5.268,0l-4.117,-9.804l-8.618,21.177Z' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3Cpath d='M197.965,29.258l0,-26.249l11.977,-0c5.341,-0 8.007,2.366 8.007,7.035c0,3.158 -2.078,5.806 -6.237,7.881l8.288,11.333l-6.111,-0l-8.048,-11.427l0,-2.217c4.816,-0.791 6.998,-2.562 6.998,-5.368c-0,-1.928 -1.04,-2.865 -3.213,-2.865l-6.408,-0l-0,21.877l-5.253,-0Z' style='fill:%230a143c;fill-rule:nonzero;'/%3E%3C/g%3E%3Cpath d='M163.174,36.709l-2.244,-0l-7.907,21.575l2.244,0l7.907,-21.575Z' style='fill:%230a143c;'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E" />

        <h1>Forget Password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">
            <span>*</span>Email
          </label>
          <input
            onBlur={() => {
              if (email.length !== 0) {
                if (validateEmail(email)) {
                  setEmailError("");
                } else {
                  setEmailError("Email is invalid");
                }
              }
            }}
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "input-error" : ""}
          />
          <div className="error-container">
            {emailError && <div className="error-message">{emailError}</div>}
          </div>

          <button type="submit" disabled={email === "" || emailError !== ""}>
            Request New Password
          </button>
          <p>
            OR<Link to="/login">Already have an account</Link>
          </p>
        </form>
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
