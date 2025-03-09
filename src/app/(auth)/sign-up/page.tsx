"use client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/Schemas/signUpSchema";
import axios,{AxiosError} from "axios"
import { ApiResponse } from "@/app/types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';


const SignUp = () => {

  const [username,setUsername]=useState('')
  const [usernameMessage,setUsernameMessage]=useState('')
  const [isCheckingUsername,setIsCheckingUsername]= useState(false)
  const [isSubmitting,setIsSubmitting]= useState(false)

  const debounced=useDebounceCallback(setUsername,300)
  const router = useRouter()

  const form = useForm({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  });
  useEffect(() =>{
   const checkUsernameUnique= async () =>{
    if (username) {
      setIsCheckingUsername(true)
      setUsernameMessage("")

      try {
       const response= await axios.get(`/api/check-username?username=${username}`)
       setUsernameMessage(response.data.message)
      } catch (error) {

        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message ?? "Error Checking Username")
      }finally{
        setIsCheckingUsername(false)
      }
    }
   }
   checkUsernameUnique()
  },[username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) =>{
    setIsSubmitting(true)
    try {
    const response= await axios.post<ApiResponse>('/api/sign-up',data)
    toast.success(response.data.message)
    router.replace(`/verify/${username}`)
    setIsSubmitting(false)
    } catch (error) {
      console.error("Error in signing up ",error)
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message
      toast.error(errorMessage)

      setIsSubmitting(false)
    }

  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Anonify
          </h1>
          <p className="mb-4">Sign Up to start your Anonymous Journey</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username"
                 {...field} onChange={(e)=>{
                  field.onChange(e)
                  debounced(e.target.value)
                 }}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email"
                 {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter Password"
                 {...field} type="password"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />   

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting? (
            <>
            <Loader2 className="mr-4 h-2 w-4 animate-spin"/> Please wait
            </>
          ):('Sign up')}
        </Button>



        </form>

      </Form>

      <div className="text-center mt-4">
        <p> Already a Member? 
          <Link href={"/sign-in" } className="text-blue-600 hover:text-blue-800 mx-1.5">
          Sign In</Link> 
        </p>
      </div>
      </div>
      
    </div>
  )
}

export default SignUp
