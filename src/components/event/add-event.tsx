"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import useCreateEvent from "@/hooks/useCreateEvent";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const eventSchema = z.object({
  title: z.string().min(1, "Event name is required"),
  city: z.string().min(1, "City is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventInterface {
  triggerNode: React.ReactNode;
  onEventCreated: (newEvent: { title: string; city: string }) => void;
}

const AddEvent = ({
  triggerNode,
}: AddEventInterface) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { mutate: createEvent, isPending } = useCreateEvent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      city: "",
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEvent(data, {
      onSuccess: () => {
        toast.success("Event created successfully!");
        reset();
        setIsDrawerOpen(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message = error?.message || "Failed to create event.";
        toast.error("❌ " + message);
      },
    });
  };

  return (
    <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <DrawerTrigger
        onClick={() => setIsDrawerOpen(true)}
        className="bg-[#DADEE2] font-semibold rounded-[16px] px-4 py-2"
      >
        {triggerNode}
      </DrawerTrigger>
      <DrawerContent className="px-6 min-h-[55vh] py-8 bg-[#232322]">
        <DrawerHeader>
          <DrawerTitle className="text-center text-[#ffffff] text-[1.1rem] font-medium">
            Enter your event details
          </DrawerTitle>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 my-6"
        >
          <div className="flex flex-col gap-2">
            <Label className="text-[#ffffff] font-semibold text-[0.85rem]">
              Event name
            </Label>
            <Input
              {...register("title")}
              className="text-black"
              placeholder="Eth Denver"
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[#ffffff] font-semibold text-[0.85rem]">
              City
            </Label>
            <Input
              {...register("city")}
              className="text-black"
              placeholder="Denver"
              disabled={isPending}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="rounded-[1rem] py-4 border border-[#ffffff] bg-[#ED2944] hover:bg-[#5A41FF] text-white text-[1.1rem]"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Continue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default AddEvent;
