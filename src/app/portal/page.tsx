"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { UserResponse } from "@/lib/response"
import { ModeToggle } from "@/components/mode-toggle"

/**
 * Portal page component that handles user registration and sign in
 * 
 * This component provides a tabbed interface for user authentication, allowing users to either
 * sign up for a new account or sign in to an existing one. It includes form validation,
 * error handling, and success notifications using a toast system.
 *
 * The component uses environment variables for API configuration and cookies for session management.
 * It automatically redirects authenticated users to the dashboard.
 *
 * @component
 * @returns {React.ReactElement} A responsive authentication form with signup and signin tabs
 */
export default function Register() {
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const defaultTab = searchParams.get('tab') || 'signup'
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [signInUsername, setSignInUsername] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const router = useRouter()

  /**
   * Handles the sign up form submission
   * 
   * Validates the form inputs, including username length and password match.
   * If validation passes, sends a registration request to the API.
   * On success, sets a user cookie and redirects to dashboard.
   * On failure, displays an error toast.
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signUpUsername.length <= 3) {
      toast({
        title: "Invalid username",
        description: "Username must be more than 3 characters long",
        variant: "destructive",
      })

      return
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      })

      return
    }

    try {
      const { data: user_data }: { data: UserResponse } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        action: "register",
        username: signUpUsername,
        password: signUpPassword,
      })
      if (user_data.id) {
        Cookies.set('uid', user_data.id, { expires: 7 })
        toast({
          title: "Account created",
          description: "You have successfully signed up",
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during sign up",
        variant: "destructive",
      })
    }
  }

  /**
   * Handles the sign in form submission
   * 
   * Attempts to authenticate the user with provided credentials.
   * On success, sets a user cookie and redirects to dashboard.
   * On failure, displays an error toast with invalid credentials message.
   *
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: user_data }: { data: UserResponse } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        action: "login",
        username: signInUsername,
        password: signInPassword,
      })
      if (user_data.id) {
        Cookies.set('uid', user_data.id, { expires: 7 })
        toast({
          title: "Signed in",
          description: "You have successfully signed in",
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex items-start justify-center min-h-screen pt-[30vh]">
        <div className="w-[400px]">
          <Tabs defaultValue={defaultTab} className="relative">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            
            <div className="relative pt-2">
              <TabsContent value="signup" className="absolute top-0 left-0 right-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                      Create a new account. All fields are required.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="signUpUsername">Username</Label>
                        <Input 
                          id="signUpUsername" 
                          value={signUpUsername}
                          onChange={(e) => setSignUpUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signUpPassword">Password</Label>
                        <Input 
                          id="signUpPassword" 
                          type="password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signUpConfirmPassword">Re-enter Password</Label>
                        <Input 
                          id="signUpConfirmPassword" 
                          type="password"
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit">Sign Up</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              <TabsContent value="signin" className="absolute top-0 left-0 right-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Sign in to your existing account.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignIn}>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="signInUsername">Username</Label>
                        <Input 
                          id="signInUsername"
                          value={signInUsername}
                          onChange={(e) => setSignInUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signInPassword">Password</Label>
                        <Input 
                          id="signInPassword" 
                          type="password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit">Sign In</Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
