"use client";

import { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import useCreateEvent from "@/hooks/useCreateEvent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const cityOptions = [
  "KATHMANDU",
  "POKHARA",
  "LALITPUR",
  "BHARATPUR",
  "BIRATNAGAR",
  "BIRGUNJ",
  "DHARAN",
  "DHANGADHI",
  "BUTWAL",
  "HETAUDA",
  "NEPALGANJ",
  "ITAHARI",
  "TRIYUGA",
  "GODAWARI",
  "GULARIYA",
  "TULSIPUR",
  "SIDDHARTHANAGAR",
  "BHAKTAPUR",
  "DHANKUTA",
  "OTHER",
];

const eventSchema = z.object({
  title: z.string().min(1, "Event name is required"),
  city: z.string().min(1, "City is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventInterface {
  triggerNode: React.ReactNode;
  onEventCreated: (event: { title: string; city: string }) => void;
}

const AddEvent = ({
  triggerNode,
  onEventCreated,
}: AddEventInterface) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createEvent, isPending } = useCreateEvent();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      city: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  // Custom validation for the form
  const isFormValid = () => {
    const watchedValues = watch();
    const hasTitle = watchedValues.title && watchedValues.title.trim() !== "";
    const hasCity = watchedValues.city && watchedValues.city.trim() !== "";
    const hasCustomCity = selectedCity === "OTHER" ? customCity && customCity.trim() !== "" : true;
    
    return hasTitle && hasCity && hasCustomCity;
  };

  // Watch form values for debugging
  const watchedValues = watch();
  console.log("Form values:", watchedValues);
  console.log("Form errors:", errors);
  console.log("Form isValid:", isValid);

  // Prevent drawer from stealing focus
  useEffect(() => {
    if (isDrawerOpen) {
      // Small delay to ensure drawer is fully rendered
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
        }
      }, 100);
    }
  }, [isDrawerOpen]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      reset();
      setCustomCity("");
      setSelectedCity("");
    }
  }, [isDrawerOpen, reset]);

  const onSubmit = (data: EventFormData) => {
    console.log("Submitting data:", data);
    
    // If "OTHER" is selected, use the custom city value
    const finalCity = data.city === "OTHER" ? customCity : data.city;
    
    const eventData = {
      ...data,
      city: finalCity,
    };
    
    createEvent(eventData, {
      onSuccess: () => {
        toast.success("Event created successfully!");
        onEventCreated(eventData);
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

  const handleCityChange = (value: string) => {
    console.log("City selected:", value);
    setSelectedCity(value);
    setValue("city", value, { shouldValidate: true });
    
    // Clear custom city if not "OTHER"
    if (value !== "OTHER") {
      setCustomCity("");
    }
  };

  return (
    <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <DrawerTrigger
        onClick={() => setIsDrawerOpen(true)}
        className="bg-[#DADEE2] font-semibold rounded-[20px] px-4 py-2"
      >
        {triggerNode}
      </DrawerTrigger>
      <DrawerContent className="px-6 min-h-[55vh] py-8 bg-[#232322] max-w-[80%] mx-auto">
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
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  ref={titleRef}
                  className="w-full h-[58px] rounded-[1rem] bg-white px-6 py-3 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ED2944] focus:border-transparent"
                  placeholder="Eth Denver"
                  disabled={isPending}
                  onFocus={(e) => {
                    console.log("Title focused");
                    e.target.select();
                  }}
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[#ffffff] font-semibold text-[0.85rem]">
              City
            </Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={handleCityChange}
                  value={selectedCity || ""}
                >
                  <SelectTrigger className="w-full h-[58px] rounded-[1rem] bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#ED2944] focus:border-transparent">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            
            {/* Custom city input field */}
            {selectedCity === "OTHER" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Enter your city name"
                  className="w-full h-[58px] rounded-[1rem] bg-white px-6 py-3 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ED2944] focus:border-transparent"
                  disabled={isPending}
                />
                {!customCity && selectedCity === "OTHER" && (
                  <p className="text-sm text-red-500 mt-1">Please enter your city name</p>
                )}
              </div>
            )}
            
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="rounded-[1rem] py-4 border border-[#ffffff] bg-[#ED2944] hover:bg-[#5A41FF] text-white text-[1.1rem]"
            disabled={isPending || !isFormValid()}
          >
            {isPending ? "Creating..." : "Continue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default AddEvent;
