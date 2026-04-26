"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function AlertDialog(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof DialogPortal>) {
  return <DialogPortal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogContent(props: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent data-slot="alert-dialog-content" showCloseButton={false} {...props} />
  );
}

function AlertDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot="alert-dialog-header" {...props} />;
}

function AlertDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter data-slot="alert-dialog-footer" {...props} />;
}

function AlertDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="alert-dialog-title" {...props} />;
}

function AlertDialogDescription(
  props: React.ComponentProps<typeof DialogDescription>,
) {
  return <DialogDescription data-slot="alert-dialog-description" {...props} />;
}

function AlertDialogAction(props: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="alert-dialog-action" {...props} />;
}

function AlertDialogCancel(props: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="alert-dialog-cancel" {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
