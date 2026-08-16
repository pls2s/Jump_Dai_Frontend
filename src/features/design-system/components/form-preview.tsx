import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSuccess,
  Input,
  Radio,
  Select,
  Textarea,
  Toggle,
} from "@/components/ui";
import { PreviewSection } from "./preview-section";

export function FormPreview() {
  return (
    <PreviewSection
      id="forms"
      title="Forms and states"
      description="Labels, help text, and validation messages are explicit and remain readable at every viewport size."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <Field>
                <FieldLabel htmlFor="course-title">Course title</FieldLabel>
                <Input
                  id="course-title"
                  name="courseTitle"
                  placeholder="e.g. Product discovery fundamentals"
                  aria-describedby="course-title-description"
                />
                <FieldDescription id="course-title-description">
                  Use a clear title learners can understand at a glance.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="audience">Primary audience</FieldLabel>
                <Select id="audience" name="audience" defaultValue="">
                  <option value="" disabled>Select an audience</option>
                  <option>University students</option>
                  <option>Working professionals</option>
                  <option>Career switchers</option>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="description" optional>Short description</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What will learners be able to do after this course?"
                />
              </Field>

              <div className="flex flex-wrap gap-3">
                <Button type="button">Save course details</Button>
                <Button variant="secondary" type="button">Save draft</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation states</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Field>
                <FieldLabel htmlFor="error-example">Knowledge source URL</FieldLabel>
                <Input
                  id="error-example"
                  validation="error"
                  defaultValue="not-a-valid-url"
                  aria-describedby="error-example-message"
                />
                <FieldError id="error-example-message">
                  Enter a complete URL beginning with https://.
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="success-example">Workspace name</FieldLabel>
                <Input
                  id="success-example"
                  validation="success"
                  defaultValue="SkillSync Learning Lab"
                  aria-describedby="success-example-message"
                />
                <FieldSuccess id="success-example-message">
                  This workspace name is available.
                </FieldSuccess>
              </Field>

              <Field>
                <FieldLabel htmlFor="disabled-example">Generated identifier</FieldLabel>
                <Input id="disabled-example" defaultValue="SS-COURSE-001" disabled />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selection controls</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FieldGroup legend="Learning format">
                <div className="grid gap-1 sm:grid-cols-2">
                  <Radio
                    name="format"
                    value="guided"
                    label="Guided"
                    description="Recommended sequence"
                    defaultChecked
                  />
                  <Radio
                    name="format"
                    value="self-paced"
                    label="Self-paced"
                    description="Flexible exploration"
                  />
                </div>
              </FieldGroup>

              <div className="grid gap-1">
                <Checkbox
                  label="Require creator verification"
                  description="AI-generated content must be reviewed before publishing."
                  defaultChecked
                />
                <Checkbox label="Allow public discovery" disabled />
              </div>

              <Toggle
                label="AI learning highlights"
                description="Call attention to AI-assisted moments in the course."
                defaultChecked
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PreviewSection>
  );
}
