"use client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signInSchema } from '@/Schemas/signInSchema'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { toast } from "sonner"
import Link from 'next/link';

const SignInPage = () => {
  const [isSubmitting,setIsSubmitting]=useState(false)

  const router=useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver:zodResolver(signInSchema),
      defaultValues:{
        identifier:'',
        password:''
      }
   

  })
  const onSubmit = async (data:z.infer<typeof signInSchema>) =>{
    setIsSubmitting(true)
   const result =  await signIn("credentials", { redirect: false, ...data })
   if(result?.error){
    toast.error("Incorrect Username or Password")
   }
   if(result?.url){
    router.replace('/dashboard')
   }
  }

   
  return (


    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
      <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome back
          </h1>
          <p className="mb-4">Sign in to continue your Anonymous Journey !</p>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email or username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>Sign In</Button>
      </form>
    </Form>
    <div className="text-center mt-4">
        <p> New here?   
          <Link href={"/sign-up" } className="text-blue-600 hover:text-blue-800 mx-1.5">
          Sign Up</Link> 
        </p>
      </div>
      </div>
      
    </div>
  );
}


export default SignInPage
