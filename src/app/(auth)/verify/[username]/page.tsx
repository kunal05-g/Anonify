"use client";

import { verifySchema } from '@/Schemas/verifySchema'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/app/types/ApiResponse'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const VerifyAccount = () => {
    const router= useRouter()
    const param= useParams<{username:string}>()

   const form = useForm({
       resolver:zodResolver(verifySchema),
     });

     const onSubmit = async(data:z.infer<typeof verifySchema>) =>{
        try {
        const response= await axios.post(`/api/verify-code`,{
          username:param.username,
          code:data.code
          })

          toast.success(response.data.message)
          router.replace('sign-in')
        } catch (error) {
         console.error("Error in signing up ",error)
               const axiosError = error as AxiosError<ApiResponse>;
               toast.error(axiosError.response?.data.message)
        }
     }
  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
      <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter Code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Verify</Button>
      </form>
    </Form>
      </div>
      
    </div>
  )
}

export default VerifyAccount
