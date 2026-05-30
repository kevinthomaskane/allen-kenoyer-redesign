"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Constants } from "@/types/database";
import { CLASS_CATEGORY_LABELS, SKILL_LEVEL_LABELS } from "@/lib/class-labels";
import {
  classFormSchema,
  newClassFormValues,
  type ClassFormValues,
} from "@/lib/class-form-schema";

import { createClass, updateClass } from "./actions";
import { ClassImageField } from "./image-field";

type ClassFormProps =
  | { mode: "create" }
  | { mode: "edit"; classId: string; defaultValues: ClassFormValues };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ClassForm(props: ClassFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues:
      props.mode === "edit" ? props.defaultValues : newClassFormValues,
  });

  // useWatch (not form.watch) so the preview's alt stays reactive without
  // tripping the React Compiler incompatible-library check.
  const imageAlt = useWatch({ control: form.control, name: "image_alt" });

  function onValid() {
    setServerError(null);
    // Send the raw string input; the action re-validates from scratch.
    const values = form.getValues();
    startTransition(async () => {
      const result =
        props.mode === "edit"
          ? await updateClass(props.classId, values)
          : await createClass(values);
      // On success the action redirects, so control only returns on error.
      if (result && !result.ok) setServerError(result.error);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValid)}
        className="max-w-3xl space-y-10"
        noValidate
      >
        <Section title="Basics">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Beginning Copper Foil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Constants.public.Enums.class_category.map((value) => (
                      <SelectItem key={value} value={value}>
                        {CLASS_CATEGORY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skill_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Constants.public.Enums.skill_level.map((value) => (
                      <SelectItem key={value} value={value}>
                        {SKILL_LEVEL_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prerequisite"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Prerequisite</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. foil proficiency required"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional. Free text for nuance the skill level can&apos;t
                  carry.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max students</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Fees">
          <FormField
            control={form.control}
            name="tuition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuition</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supply_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supply fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kit_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kit fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fee_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee notes</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. + glass at cost" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Image">
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Image</FormLabel>
                <ClassImageField
                  value={field.value ?? ""}
                  alt={imageAlt ?? ""}
                  onChange={field.onChange}
                  disabled={pending}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image_alt"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Image alt text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Describe the image for screen readers"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Required when an image is set.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Publish">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="accent-primary mt-0.5 size-4"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Goes live on the public site once it also has a published
                      cohort with upcoming sessions.
                    </FormDescription>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {serverError && (
          <p role="alert" className="text-destructive text-sm">
            {serverError}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save class"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
