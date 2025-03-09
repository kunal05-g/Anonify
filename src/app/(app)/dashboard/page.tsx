'use client';

import {useCallback, useEffect, useState} from "react";
import {Message} from "@/model/User";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {acceptMessageSchema} from "@/Schemas/acceptMessageSchema";
import axios, {AxiosError} from "axios";
import {ApiResponse} from "@/app/types/ApiResponse";
import { Loader2, RefreshCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const handleDeleteMessage = (messageId:string) => {
        setMessages(messages.filter(message=>message.id!==messageId));
    }

    const {data:session} = useSession()
    const form = useForm({
        resolver:zodResolver(acceptMessageSchema)
    });

    const {register, watch, setValue} =form;

    const acceptMessage = watch('acceptMessages')

    const fetchAcceptMessage = useCallback(async () => {
            setIsSwitchLoading(true);
            try {
                const response = await axios.get<ApiResponse>('/api/accept-messages')
                setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast.error("Failed to fetch messages")
            }finally {
                setIsSwitchLoading(false);
            }
        },
        [setValue])

    const fetchMessages = useCallback(async (refresh:boolean = false)=>{
       setLoading(true);
        setIsSwitchLoading(false);

        try {
            const response =await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])
            if (refresh){
                toast("Showing latest messages")
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error("Failed to fetch messages")
        }finally {
            setIsSwitchLoading(false);
            setLoading(false);
        }
    },[setMessages,setLoading])

    useEffect(() => {
        if (! session||!session.user) return
        fetchMessages()
        fetchAcceptMessage()
    },[session,setValue,fetchAcceptMessage,fetchMessages])

    const handleSwitchChange = async() =>{
        try{
           await axios.post<ApiResponse>('/api/accept-messages',{
                acceptMessage:!acceptMessage
            })
          setValue('acceptMessages',!acceptMessage)
        }catch(error){
            toast.error("Failed to fetch messages")
        }

        }
    if (!session || !session.user){
        return <div>Please Login</div>
    }
    const { username } = session.user;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast( 'Profile URL has been copied to clipboard.')
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessage}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message.id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}};

export default Dashboard
