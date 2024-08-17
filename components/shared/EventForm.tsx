"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EventFormSchema } from "@/lib/validator";
import { eventDefaultValues } from "@/constants";
import Dropdown from "./Dropdown";
import { Textarea } from "../ui/textarea";
import { FileUploader } from "./FileUploader";
import { useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
import { useUploadThing } from "@/lib/uploadthing/uploadthing";
import { handleError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/database/models/event.model";

interface EventFormProps {
  userId: string;
  type: "Create" | "Update";
  event?: IEvent;
}

const EventForm = ({ userId, type, event }: EventFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dateOpen, setDateOpen] = useState(false);
  const initialValues =
    event && type === "Update"
      ? {
          ...event,
          startDateTime: event.startDateTime
            ? new Date(event.startDateTime)
            : undefined,
          endDateTime: event.endDateTime
            ? new Date(event.endDateTime)
            : undefined,
        }
      : eventDefaultValues;
  const router = useRouter();
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: initialValues,
  });

  const { startUpload } = useUploadThing("imageUploader");

  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    let uploadedImageUrl = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (uploadedImages) {
        uploadedImageUrl = uploadedImages[0].url;
      } else
        return console.error("Image upload failed, please try again later");
    }

    if (type === "Create") {
      try {
        // create event
        const newEvent = await createEvent({
          event: {
            ...values,
            imageUrl: uploadedImageUrl,
          },
          userId,
          path: "/profile",
        });
        if (newEvent) {
          form.reset();
          router.push(`/events/${newEvent._id}`);
        }
      } catch (error) {
        handleError(error);
      }
    }
    if (type === "Update") {
      // update event
      const eventId = event?._id;
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, imageUrl: uploadedImageUrl, _id: eventId },
          path: `/events/${eventId}`,
        });

        if (updatedEvent) {
          form.reset();
          router.push(`/events/${updatedEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const dateOpenController = (id: string) => {
    if (!dateOpen) {
      setDateOpen(true);
      document.getElementById(`${id}`)?.focus();
    } else {
      dateClickOutside(`${id}`);
    }
  };

  const dateClickOutside = (id: string) => {
    setDateOpen(false);
    document.getElementById("startDateTime")?.blur();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Event Title"
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Dropdown
                    onChangeHandler={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-40 sm:h-72 resize-none">
                  <Textarea
                    placeholder="Description"
                    {...field}
                    className="textarea"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-60 resize-none">
                  <FileUploader
                    onFieldChange={field.onChange}
                    imageUrl={field.value}
                    setFiles={setFiles}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center overflow-hidden rounded-sm bg-grey-50 px-2">
                    <Image
                      src="/assets/icons/location-grey.svg"
                      width={20}
                      height={20}
                      alt="location"
                    />
                    <Input
                      placeholder="Event Location / Online"
                      {...field}
                      className="input-field"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl
                  onClick={() => {
                    dateOpenController("startDateTime");
                  }}
                >
                  <div className="flex-center overflow-hidden rounded-sm bg-grey-50 px-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      width={20}
                      height={20}
                      alt="calendar"
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      Start Date & Time
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="input-field"
                      wrapperClassName="datePicker"
                      id="startDateTime"
                      onClickOutside={() => dateClickOutside("startDateTime")}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl
                  onClick={() => {
                    dateOpenController("endDateTime");
                  }}
                >
                  <div className="flex-center overflow-hidden rounded-sm bg-grey-50 px-2">
                    <Image
                      src="/assets/icons/calendar.svg"
                      width={20}
                      height={20}
                      alt="calendar"
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">
                      End Date & Time
                    </p>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="input-field"
                      wrapperClassName="datePicker"
                      id="endDateTime"
                      onClickOutside={() => dateClickOutside("endDateTime")}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center overflow-hidden rounded-sm bg-grey-50 px-2">
                    <Image
                      src="/assets/icons/dollar.svg"
                      width={20}
                      height={20}
                      alt="price"
                      className="filter-grey"
                    />
                    <Input
                      placeholder="Price"
                      {...field}
                      className="input-field p-regular-16"
                      type="number"
                    />
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <label
                                htmlFor="isFree"
                                className="text-grey-600 whitespace-nowrap pr-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Free Event
                              </label>
                              <Checkbox
                                id="isFree"
                                className="mr-2"
                                onCheckedChange={field.onChange}
                                checked={field.value}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center overflow-hidden rounded-sm bg-grey-50 px-2">
                    <Image
                      src="/assets/icons/link.svg"
                      width={20}
                      height={20}
                      alt="link"
                    />
                    <Input
                      placeholder="URl"
                      {...field}
                      className="input-field"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="col-span-2 w-full"
        >
          {`${
            form.formState.isSubmitting
              ? type === "Update"
                ? "Updating"
                : "Creating"
              : type
          } Event`}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
