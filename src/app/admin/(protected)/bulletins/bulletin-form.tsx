"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { MarkdownToolbar } from "./markdown-toolbar";
import { bulletinFormSchema, type BulletinFormValues } from "./schema";

export interface BulletinFormProps {
  defaultValues: BulletinFormValues;
  // A bound Server Action (create or update). Resolves to an error object on
  // failure; on success it redirects, so the promise never resolves here.
  action: (values: BulletinFormValues) => Promise<{ error: string } | void>;
  submitLabel: string;
}

export function BulletinForm({
  defaultValues,
  action,
  submitLabel,
}: BulletinFormProps) {
  const form = useForm<BulletinFormValues>({
    resolver: zodResolver(bulletinFormSchema),
    defaultValues,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSubmit(values: BulletinFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) setFormError(result.error);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-2xl space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Holiday closure" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <MarkdownToolbar
                textareaRef={textareaRef}
                onChange={(value) =>
                  form.setValue("message", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Write your announcement…"
                  {...field}
                  ref={(el) => {
                    field.ref(el);
                    textareaRef.current = el;
                  }}
                />
              </FormControl>
              <FormDescription>
                Use the buttons to add bold, italic, links, and lists.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="displayStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display start</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  When the bulletin starts showing. Defaults to now.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Display end{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Leave blank for an open-ended notice.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Published</FormLabel>
                <FormDescription>
                  Drafts stay hidden. A published bulletin with a future start
                  is queued until then.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
