import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginMutation } from "@/features/auth/authApiSlice";

const LoginSchema = z.object({
  userlogin: z.string().min(2, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof LoginSchema>;

export const LoginPage: React.FC = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const form = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { userlogin: "", password: "" },
  });

  const handleAlert = (
    message: string,
    type: "success" | "error" = "error",
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const setCookie = (name: string, value: string, seconds: number) => {
    const cookiePrefix = "ikoncloud_next_";
    let expires = "";
    if (seconds) {
      const date = new Date();
      date.setTime(date.getTime() + seconds * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
      cookiePrefix + name + "=" + (value || "") + expires + "; path=/";
  };

  const onSubmit = async (data: LoginData) => {
    try {
      const result = await login({
        ...data,
        credentialType: "PASSWORD",
      }).unwrap();

      handleAlert("Login successful!", "success");

      // Set cookies for ikon-react-components-lib compatibility
      setCookie("accessToken", result.accessToken, result.expiresIn);
      setCookie("refreshToken", result.refreshToken, result.refreshExpiresIn);

      // Hard redirect required: main.tsx renders LoginPage and ProviderWrapper
      // as two separate React trees based on pathname. A soft navigate() won't
      // switch trees — we need a full page reload to enter the ProviderWrapper branch.
      setTimeout(() => {
        window.location.href = "/main/dashboard";
      }, 1000);
    } catch (err: any) {
      handleAlert(err?.data?.error || "Login failed.");
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(104.96deg, #131a29 0%, #1d2634 56.6%, #2f2e78 100.68%)",
      }}
      className="h-screen w-full text-white font-sans overflow-hidden"
    >
      <div className="flex h-full w-full">
        <div className="flex flex-col md:flex-row overflow-hidden rounded-lg shadow-lg w-full">
          {/* Left Section */}
          <div className="flex flex-col h-full justify-center md:w-1/3 p-10 w-full relative">
            <img
              src="/assets/images/dark/keross-logo.png"
              alt="Keross Logo"
              className="absolute top-10 left-10 w-[15%]"
            />
            <blockquote className="text-3xl italic mt-20 text-left">
              "Step into the future of
              <br />
              <strong>Collaboration with our AI-Agent</strong>
              <br />
              <strong>Domain Experts.</strong>"
            </blockquote>
          </div>

          {/* Video Section */}
          <div className="flex flex-col items-center justify-center md:w-1/3 p-10 w-full">
            <video
              width="500"
              className="mix-blend-lighten max-w-full h-auto"
              autoPlay
              muted
              loop
            >
              <source src="/assets/terminal.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right Section (Login Form) */}
          <div className="flex flex-col items-center justify-center text-center md:w-1/3 p-10 w-full text-gray-300">
            <div className="flex w-full justify-center mb-4">
              <img
                src="/assets/images/dark/ikon-logo.png"
                alt="IKON Logo"
                className="w-[30%]"
              />
            </div>
            <p className="text-gray-300 mb-6 text-lg">
              Harness the Power of Data
            </p>

            <form
              className="p-10 pt-0 w-3/4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 bg-[#252a48] text-white border-none rounded-md focus:ring-2 focus:ring-[#8a86ff] outline-none"
                  placeholder="Username"
                  autoComplete="off"
                  {...form.register("userlogin")}
                />
                {form.formState.errors.userlogin && (
                  <p className="text-xs text-red-400 mt-1 text-left">
                    {form.formState.errors.userlogin.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  className="w-full p-3 bg-[#252a48] text-white border-none rounded-md focus:ring-2 focus:ring-[#8a86ff] outline-none"
                  placeholder="Password"
                  autoComplete="off"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-400 mt-1 text-left">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="text-right mb-4">
                <a href="#" className="text-[#8a86ff] text-sm no-underline">
                  Forgot Password?
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => form.reset()}
                  className="w-1/2 p-3 bg-gray-600 rounded-md hover:bg-gray-500 transition border-none cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 p-3 bg-[#635bff] rounded-md hover:bg-[#5249db] transition border-none cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>

            <p className="text-gray-400 text-sm mt-4 text-center">
              Looking for Support?
              <br />
              Version 8.0.0
            </p>

            <footer className="mt-4 text-sm text-gray-400 text-center">
              <a
                href="http://keross.com/about"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#888]"
              >
                About Us
              </a>
              {" | "}
              <a
                href="http://keross.com/contact"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#888]"
              >
                Get in Touch
              </a>
              {" | "}
              <a
                href="http://keross.com/privacy-policy"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#888]"
              >
                Privacy Policy
              </a>
            </footer>
          </div>
        </div>
      </div>

      {/* Alert Container */}
      {alert && (
        <div className="bottom-5 fixed right-5 z-50 transition-transform duration-300 transform">
          <div
            className={`flex items-center justify-between p-3 text-white rounded-md shadow-lg ${alert.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-3 text-white font-bold px-2 py-1 flex items-center justify-center rounded-full hover:bg-gray-700 transition cursor-pointer"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
