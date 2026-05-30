"use client";

import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Constants } from "@/types/database";
import { CLASS_CATEGORY_LABELS, SKILL_LEVEL_LABELS } from "@/lib/class-labels";
import { formatNextSession, formatStudioDate } from "@/lib/datetime";
import { classStatusInfo, type ClassStatusState } from "@/lib/class-status";
import {
  selectClassRows,
  type ClassListFilters,
  type ClassListRow,
} from "@/lib/class-list";

import { StatusPill } from "./status-pill";

const STATUS_OPTIONS = (
  [
    "live",
    "draft",
    "hidden_no_cohort",
    "hidden_no_sessions",
  ] as const satisfies ClassStatusState[]
).map((value) => ({ value, label: classStatusInfo(value).label }));

const CATEGORY_OPTIONS = Constants.public.Enums.class_category.map((value) => ({
  value,
  label: CLASS_CATEGORY_LABELS[value],
}));

const SKILL_OPTIONS = Constants.public.Enums.skill_level.map((value) => ({
  value,
  label: SKILL_LEVEL_LABELS[value],
}));

function FacetSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-44" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ClassesTable({ rows }: { rows: ClassListRow[] }) {
  const [status, setStatus] =
    useState<NonNullable<ClassListFilters["status"]>>("all");
  const [category, setCategory] =
    useState<NonNullable<ClassListFilters["category"]>>("all");
  const [skillLevel, setSkillLevel] =
    useState<NonNullable<ClassListFilters["skillLevel"]>>("all");
  const [search, setSearch] = useState("");

  const visible = selectClassRows(rows, {
    status,
    category,
    skillLevel,
    search,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Search
          </span>
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56"
            aria-label="Search classes by name"
          />
        </div>
        <FacetSelect
          label="Status"
          value={status}
          onValueChange={(value) =>
            setStatus(value as NonNullable<ClassListFilters["status"]>)
          }
          options={STATUS_OPTIONS}
        />
        <FacetSelect
          label="Category"
          value={category}
          onValueChange={(value) =>
            setCategory(value as NonNullable<ClassListFilters["category"]>)
          }
          options={CATEGORY_OPTIONS}
        />
        <FacetSelect
          label="Skill level"
          value={skillLevel}
          onValueChange={(value) =>
            setSkillLevel(value as NonNullable<ClassListFilters["skillLevel"]>)
          }
          options={SKILL_OPTIONS}
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          No classes match these filters.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Skill level</TableHead>
                <TableHead>Next session</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link
                      href={`/admin/classes/${row.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusPill state={row.status} />
                  </TableCell>
                  <TableCell>{CLASS_CATEGORY_LABELS[row.category]}</TableCell>
                  <TableCell>{SKILL_LEVEL_LABELS[row.skillLevel]}</TableCell>
                  <TableCell>{formatNextSession(row.nextSessionAt)}</TableCell>
                  <TableCell>{formatStudioDate(row.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
