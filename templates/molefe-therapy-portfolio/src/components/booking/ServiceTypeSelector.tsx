import { motion } from "framer-motion";
import { Clock, MapPin, Video, Users } from "lucide-react";
import type { ServiceType } from "@/hooks/useServiceTypes";

interface ServiceTypeSelectorProps {
  services: ServiceType[];
  selected: ServiceType | null;
  onSelect: (service: ServiceType) => void;
}

const modeIcon = (mode: string) => {
  switch (mode) {
    case "in_person": return <MapPin className="w-4 h-4" />;
    case "telehealth": return <Video className="w-4 h-4" />;
    default: return <><MapPin className="w-4 h-4" /><Video className="w-4 h-4" /></>;
  }
};

const modeLabel = (mode: string) => {
  switch (mode) {
    case "in_person": return "In-Person";
    case "telehealth": return "Online";
    default: return "In-Person or Online";
  }
};

const ServiceTypeSelector = ({ services, selected, onSelect }: ServiceTypeSelectorProps) => {
  return (
    <div className="bg-card rounded-xl border p-6">
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">Select a Service</h3>
      <p className="font-body text-sm text-muted-foreground mb-6">Choose the type of session you'd like to book.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((service, i) => {
          const isSelected = selected?.id === service.id;
          return (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(service)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <p className="font-body font-semibold text-foreground text-sm mb-1">{service.name}</p>
              {service.description && (
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
              )}
              <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  {modeIcon(service.mode)}
                  {modeLabel(service.mode)}
                </span>
                {service.max_participants > 1 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Group
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
