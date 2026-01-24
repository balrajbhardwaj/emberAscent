"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { createInitialChild } from "@/app/(auth)/setup/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarPicker } from "@/components/setup/AvatarPicker"
import { useToast } from "@/hooks/use-toast"

const childSetupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  yearGroup: z.string().refine((val) => ["3", "4", "5", "6"].includes(val), {
    message: "Please select a year group",
  }),
  targetSchool: z.string().max(100).optional(),
  avatarUrl: z.string().optional(),
})

type ChildSetupFormData = z.infer<typeof childSetupSchema>

export function ChildSetupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>("boy-1")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ChildSetupFormData>({
    resolver: zodResolver(childSetupSchema),
    defaultValues: {
      avatarUrl: "boy-1",
    },
  })

  const onSubmit = async (data: ChildSetupFormData) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("yearGroup", data.yearGroup)
      if (data.targetSchool) {
        formData.append("targetSchool", data.targetSchool)
      }
      formData.append("avatarUrl", selectedAvatar)

      const result = await createInitialChild(formData)

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      toast({
        title: "Success!",
        description: result.message,
      })

      router.push("/practice")
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Child&apos;s First Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Emma"
          autoComplete="given-name"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearGroup">Year Group</Label>
        <select
          id="yearGroup"
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("yearGroup")}
        >
          <option value="">Select year group</option>
          <option value="3">Year 3 (Age 7-8)</option>
          <option value="4">Year 4 (Age 8-9)</option>
          <option value="5">Year 5 (Age 9-10)</option>
          <option value="6">Year 6 (Age 10-11)</option>
        </select>
        {errors.yearGroup && (
          <p className="text-sm text-red-600">{errors.yearGroup.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetSchool">
          Target School <span className="text-slate-400">(optional)</span>
        </Label>
        <Input
          id="targetSchool"
          type="text"
          placeholder="e.g. Grammar School Name"
          disabled={isLoading}
          {...register("targetSchool")}
        />
        {errors.targetSchool && (
          <p className="text-sm text-red-600">{errors.targetSchool.message}</p>
        )}
      </div>

      <AvatarPicker
        value={selectedAvatar}
        onChange={(avatarId) => {
          setSelectedAvatar(avatarId)
          setValue("avatarUrl", avatarId)
        }}
      />

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating profile...
          </>
        ) : (
          "Create Profile"
        )}
      </Button>
    </form>
  )
}
