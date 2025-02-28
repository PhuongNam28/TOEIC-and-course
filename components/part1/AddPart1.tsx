"use client";

import { Exam, QuestionPart1, TopicPart1 } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Form, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { Loader2, Pencil, PencilLine, Trash, XCircle } from "lucide-react";
import { UploadButton } from "../uploadthing";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import "react-quill/dist/quill.snow.css"; // Import stylesheet
import dynamic from "next/dynamic";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import apiClient from "@/lib/api-client";
import { USER_API_ROUTES } from "@/ultis/api-route";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type PartType =
  | "part1"
  | "part2"
  | "part3"
  | "part4"
  | "part5"
  | "part6"
  | "part7";

interface AddPart1FormProps {
  exam?: Exam & {
    part1s: QuestionPart1[];
  };
  part1?: QuestionPart1;
  handleDialogueOpen: (part: PartType) => void;
  topics: TopicPart1[];
}

const formSchema = z.object({
  audioFile: z.string().min(1, { message: "Audio is required" }),
  imageFile: z.string().min(1, { message: "Image is required" }),
  answer1: z.string().min(1, { message: "must be atleast 1 characters long." }),
  answer2: z.string().min(1, { message: "must be atleast 1 characters long." }),
  answer3: z.string().min(1, { message: "must be atleast 1 characters long." }),
  answer4: z.string().min(1, { message: "must be atleast 1 characters long." }),
  topicId: z.string().nullable(), // Change this to a single string
  correctAnswer: z
    .string()
    .min(1, { message: "must be atleast 1 characters long." }), // Đáp án đúng
  explainAnswer: z
    .string()
    .min(3, { message: "must be atleast 3 characters long." }),
});

const AddPart1 = ({ exam, part1, handleDialogueOpen }: AddPart1FormProps) => {
  const [image, setImage] = useState<string | undefined>(part1?.imageFile);

  const [imageIsDeleting, setImageIsDeleting] = useState(false);

  const [audio, setAudio] = useState<string | undefined>(part1?.audioFile);

  const [audioIsDeleting, setAudioIsDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [topics, setTopics] = useState<TopicPart1[]>([]);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: part1 || {
      audioFile: "",
      imageFile: "",
      answer1: "A",
      answer2: "B",
      answer3: "C",
      answer4: "D",
      correctAnswer: "", // Đáp án đúng
      explainAnswer: "",
      topicId: "",
    },
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await apiClient.get(USER_API_ROUTES.GET_TOPICS_PART1);

        if (response.data.topics) {
          setTopics(response.data.topics); // Correctly set the topics array
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (typeof image === "string") {
      form.setValue("imageFile", image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    //eslint-disable-next-line
  }, [image]);

  useEffect(() => {
    if (typeof audio === "string") {
      form.setValue("audioFile", audio, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    //eslint-disable-next-line
  }, [audio]);

  const handleImageDelete = (image: string) => {
    setImageIsDeleting(true);
    const imageKey = image.substring(image.lastIndexOf("/") + 1);

    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then((res) => {
        if (res.data.success) {
          setImage("");
          toast({
            variant: "default",
            description: "Image removed",
          });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      })
      .finally(() => {
        setImageIsDeleting(false);
      });
  };

  const handleAudioDelete = (audio: string) => {
    setAudioIsDeleting(true);
    const audioKey = audio.substring(audio.lastIndexOf("/") + 1);

    axios
      .post("/api/uploadthing/delete", { audioKey })
      .then((res) => {
        if (res.data.success) {
          setAudio("");
          toast({
            variant: "default",
            description: "Image removed",
          });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      })
      .finally(() => {
        setAudioIsDeleting(false);
      });
  };

  const handleOpenDialogue = () => {
    // Assuming you want to open the dialogue for "part1"
    handleDialogueOpen("part1");
  };

  const handleQuestionDelete = (part1: QuestionPart1) => {
    setIsLoading(true);
    const imageKey = part1.imageFile.substring(part1.imageFile.lastIndexOf("/" + 1));

    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then(() => {
        axios
          .delete(`/api/part1/${part1.id}`)
          .then(() => {
            router.refresh();
            toast({
              variant: "default",
              description: "Question Delete!",
            });
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
            toast({
              variant: "destructive",
              description: "Something went wrong!",
            });
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          description: "Something went wrong!",
        });
      });
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (exam && part1) {
      axios
        .patch(`/api/part1/${part1.id}`, values)
        .then((res) => {
          toast({
            variant: "default",
            description: "Question Update!",
          });
          router.refresh();
          setIsLoading(false);
          handleOpenDialogue();
        })
        .catch((err) => {
          console.log(err);
          toast({
            variant: "destructive",
            description: "Some thing went wrong!",
          });
          setIsLoading(false);
        });
    } else {
      if (!exam) return;
      axios

        .post("/api/part1", { ...values, examId: exam.id })
        .then((res) => {
          toast({
            variant: "default",
            description: "Question created.",
          });
          router.refresh();
          setIsLoading(false);
          handleOpenDialogue();
        })
        .catch((err) => {
          console.log(err);
          toast({
            variant: "destructive",
            description: "Some thing went wrong!",
          });
          setIsLoading(false);
        });
    }
  }
  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3">
                <FormLabel>Upload an Image</FormLabel>
                <FormDescription>
                  Choose an image that will show-case your Exam nicely
                </FormDescription>
                <FormControl>
                  {image ? (
                    <>
                      <div className="relative max-w-[400px] min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                        <Image
                          fill
                          src={image}
                          alt="Exam Image"
                          className="object-contain"
                        />
                        <Button
                          onClick={() => handleImageDelete(image)}
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-[-12px] top-0"
                        >
                          {imageIsDeleting ? <Loader2 /> : <XCircle />}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex flex-col items-center max-w-[4000px] p-12 border-2 border-dashed
                          border-primary/50 rounded mt-4"
                      >
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            setImage(res[0].url);
                            toast({
                              variant: "default",
                              description: "Upload Completed",
                            });
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: "destructive",
                              description: `ERROR! ${error.message}`,
                            });
                          }}
                        />
                      </div>
                    </>
                  )}
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audioFile"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3">
                <FormLabel>Upload an Audio File</FormLabel>
                <FormDescription>
                  Choose an audio file that will complement your Exam.
                </FormDescription>
                <FormControl>
                  {audio ? (
                    <>
                      <div className="relative max-w-[400px] min-w-[200px] mt-4">
                        <audio controls>
                          <source src={audio} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <Button
                          onClick={() => handleAudioDelete(audio)}
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-[-12px] top-[-12px]"
                        >
                          {audioIsDeleting ? <Loader2 /> : <XCircle />}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex flex-col items-center max-w-[4000px] p-12 border-2 border-dashed
                border-primary/50 rounded mt-4"
                      >
                        <UploadButton
                          endpoint="audioUploader"
                          onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            setAudio(res[0].url);
                            toast({
                              variant: "default",
                              description: "Audio upload completed.",
                            });
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: "destructive",
                              description: `ERROR! ${error.message}`,
                            });
                          }}
                        />
                      </div>
                    </>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topicId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Topic *</FormLabel>
                <FormDescription>
                  Please select the topic related to your content
                </FormDescription>
                <Select
                  disabled={isLoading}
                  onValueChange={(value) => field.onChange(value)} // Handle value change
                  value={field.value ?? ""} // Single string value
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="answer1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer 1</FormLabel>

                <FormControl>
                  <Input placeholder="Answer 1" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="answer2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer 2</FormLabel>

                <FormControl>
                  <Input placeholder="Answer 2" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="answer3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer 3</FormLabel>

                <FormControl>
                  <Input placeholder="Answer 3" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="answer4"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer 4</FormLabel>

                <FormControl>
                  <Input placeholder="Answer 4" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>correctAnswer</FormLabel>

                <FormControl>
                  <Input placeholder="correctAnswer" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explainAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explain Answer</FormLabel>

                <FormControl>
                  <ReactQuill
                    placeholder="Explain Answer!"
                    value={field.value}
                    onChange={field.onChange}
                    style={{
                      height: "300px",
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <div className="pt-4 pb-2 flex gap-2">
            {part1 ? (
              <>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  type="button"
                  className="max-w-[150px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" />
                      Updating
                    </>
                  ) : (
                    <>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleQuestionDelete(part1)}
                  type="button"
                  className="max-w-[150px] bg-red-500 hover:bg-red-600"
                  disabled={isLoading}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                type="button"
                className="max-w-[150px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Creating
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Create Question
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPart1;
