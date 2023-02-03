package com.appsmith.external.models;

import com.appsmith.external.exceptions.BaseException;
import com.appsmith.external.exceptions.ErrorDTO;
import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import com.google.gson.InstanceCreator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatasourceStructure {

    @JsonView(Views.Public.class)
    List<Table> tables;

    public DatasourceStructure(List<Table> tables) {
        this.tables = tables;
    }

    public enum TableType {
        TABLE,
        VIEW,
        ALIAS,
        COLLECTION,
        BUCKET,
    }

    @Data
    @AllArgsConstructor
    public static class Table {

        @JsonView(Views.Public.class)
        TableType type;

        @JsonView(Views.Public.class)
        String schema;

        @JsonView(Views.Public.class)
        String name;

        @JsonView(Views.Public.class)
        List<Column> columns;

        @JsonView(Views.Public.class)
        List<Key> keys;

        @JsonView(Views.Public.class)
        List<Template> templates;
    }

    @Data
    @AllArgsConstructor
    public static class Column implements Comparable<Column> {
    
        @JsonView(Views.Public.class)
        String name;

        @JsonView(Views.Public.class)
        String type;

        @JsonView(Views.Public.class)
        String defaultValue;

        // This field will be true for columns with auto-increment, default-expr with next value method etc.
        @JsonView(Views.Public.class)
        Boolean isAutogenerated;

        @Override
        public int compareTo(Column other) {
            if (other == null || other.getName() == null) {
                return 1;
            }

            return name.compareTo(other.getName());
        }
    }

    public interface Key extends Comparable<Key> {
        @JsonView(Views.Public.class)
        String getType();

        @Override
        default int compareTo(Key other) {
            if (this instanceof PrimaryKey && other instanceof ForeignKey) {
                return -1;
            } else if (this instanceof ForeignKey && other instanceof PrimaryKey) {
                return 1;
            } else if (this instanceof PrimaryKey && other instanceof PrimaryKey) {
                final PrimaryKey thisKey = (PrimaryKey) this;
                final PrimaryKey otherKey = (PrimaryKey) other;
                if (thisKey.getName() != null && otherKey.getName() != null) {
                    return thisKey.getName().compareTo(otherKey.getName());
                } else if (thisKey.getName() == null) {
                    return 1;
                } else {
                    return -1;
                }
            }

            return 0;
        }
    }

    @Data
    @AllArgsConstructor
    public static class PrimaryKey implements Key {
        @JsonView(Views.Public.class)
        String name;

        @JsonView(Views.Public.class)
        List<String> columnNames;

        @JsonView(Views.Public.class)
        public String getType() {
            return "primary key";
        }
    }

    @Data
    @AllArgsConstructor
    public static class ForeignKey implements Key {
        @JsonView(Views.Public.class)
        String name;

        @JsonView(Views.Public.class)
        List<String> fromColumns;

        @JsonView(Views.Public.class)
        List<String> toColumns;

        @JsonView(Views.Public.class)
        public String getType() {
            return "foreign key";
        }
    }

    @Data
    @NoArgsConstructor
    public static class Template {
        @JsonView(Views.Public.class)
        String title;

        @JsonView(Views.Public.class)
        String body;

        @JsonView(Views.Public.class)
        Object configuration;

        // To create templates for plugins which store the configurations
        // in List<Property> format
        public Template(String title, String body, List<Property> configuration) {
            this.title = title;
            this.body = body;
            this.configuration = configuration;
        }

        // To create templates for plugins with UQI framework which store the configurations
        // as a map
        public Template(String title, String body, Map<String, ?> configuration) {
            this.title = title;
            this.body = body;
            this.configuration = configuration;
        }

        /**
         * Create templates by passing UQI framework config.
         * <p>
         * For integrations that use UQI interface, a config map is used to indicate the required template.
         */
        public Template(String title, Map<String, ?> configuration) {
            this.title = title;
            this.configuration = configuration;
        }

        // Creating templates without configuration
        public Template(String title, String body) {
            this.title = title;
            this.body = body;
        }
    }

    @JsonView(Views.Public.class)
    ErrorDTO error;

    @JsonView(Views.Public.class)
    public void setErrorInfo(Throwable error) {
        this.error = new ErrorDTO();
        this.error.setMessage(error.getMessage());

        if (error instanceof BaseException) {
            this.error.setCode(((BaseException)error).getAppErrorCode());
        }
    }
    
    /**
     * Instance creator is required while de-serialising using Gson as key instance can't be invoked with
     * no-args constructor
     */
    public static class KeyInstanceCreator implements InstanceCreator<Key> {
        @Override
        public Key createInstance(Type type) {
            Key key = new Key() {
                @Override
                public String getType() {
                    return null;
                }
            };
            return key;
        }
    }
    
}
